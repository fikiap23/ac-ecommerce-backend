import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import {
  IFilterProduct,
  ISelectGeneralProduct,
} from '../interfaces/product.interface';
import { CategoryProductRepository } from '../repositories/category-product.repository';
import { Prisma } from '@prisma/client';
import { selectGeneralProduct } from 'src/prisma/queries/product/props/select-product.prop';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomError } from 'helpers/http.helper';
import { ModelRepository } from '../repositories/model.repository';
import { CapacityRepository } from '../repositories/capacity.repository';
import { TypeRepository } from '../repositories/type.repository';
import {
  assertImages,
  deleteFilesBestEffort,
  saveImages,
} from 'helpers/helper';

@Injectable()
export class ProductService {
  constructor(
    private readonly categoryProductRepository: CategoryProductRepository,
    private readonly productRepository: ProductRepository,
    private readonly prisma: PrismaService,
    private readonly modelRepository: ModelRepository,
    private readonly capacityRepository: CapacityRepository,
    private readonly typeRepository: TypeRepository,
  ) {}

  async create(dto: CreateProductDto) {
    const {
      packageType,
      serviceType,
      variants,
      bundlingItems,
      typeUuid,
      modelUuid,
      capacityUuid,
    } = dto;

    // === VALIDASI RELASI ===
    let typeConnect: any = undefined;
    let modelConnect: any = undefined;
    let capacityConnect: any = undefined;
    let categoryProductConnect: any = undefined;

    if (typeUuid) {
      await this.typeRepository.getThrowByUuid({ uuid: typeUuid });
      typeConnect = { connect: { uuid: typeUuid } };
    }
    if (modelUuid) {
      await this.modelRepository.getThrowByUuid({ uuid: modelUuid });
      modelConnect = { connect: { uuid: modelUuid } };
    }
    if (capacityUuid) {
      await this.capacityRepository.getThrowByUuid({ uuid: capacityUuid });
      capacityConnect = { connect: { uuid: capacityUuid } };
    }
    if (dto.categoryProductUuid && packageType !== 'BUNDLE') {
      await this.categoryProductRepository.getThrowByUuid({
        uuid: dto.categoryProductUuid,
      });
      categoryProductConnect = { connect: { uuid: dto.categoryProductUuid } };
    }

    // ============ FILE HANDLING RAPIH ============
    // kumpulkan path untuk rollback jika DB gagal
    const allAbsToCleanup: string[] = [];

    const productImages = dto.productImages ?? [];
    const variantImages = (variants ?? []).map((v) => v.image ?? []);

    let productImageRows: { url: string }[] | undefined = undefined;
    let variantPhotoUrls: (string | null)[] | undefined = undefined;
    let bundleImageRows: { url: string }[] | undefined = undefined;

    if (packageType === 'SINGLE') {
      // validasi
      assertImages(productImages);
      variantImages.forEach(assertImages);

      // simpan gambar produk
      const savedProductImages = await saveImages(
        productImages,
        'upload/product/productImage',
        'Product Image',
      );
      productImageRows = savedProductImages.map((s) => ({ url: s.url }));
      allAbsToCleanup.push(...savedProductImages.map((s) => s.absPath));

      const savedVariantImages = await Promise.all(
        variantImages.map((imgs) =>
          saveImages(imgs, 'upload/product/variantImage', 'Variant Image'),
        ),
      );
      variantPhotoUrls = savedVariantImages.map((arr) =>
        arr.length ? arr[0].url : null,
      );
      allAbsToCleanup.push(...savedVariantImages.flat().map((s) => s.absPath));
    } else if (packageType === 'BUNDLE') {
      // validasi
      assertImages(productImages);

      // simpan gambar bundle
      const savedBundleImages = await saveImages(
        productImages,
        'upload/bundle/bundleImage',
        'Bundle Image',
      );
      bundleImageRows = savedBundleImages.map((s) => ({ url: s.url }));
      allAbsToCleanup.push(...savedBundleImages.map((s) => s.absPath));
    }

    try {
      switch (packageType) {
        case 'SINGLE': {
          if (serviceType === 'SERVICE') {
            const created = await this.prisma.$transaction(async (tx) => {
              return tx.product.create({
                data: {
                  name: dto.name,
                  description: dto.description,
                  price: dto.price,
                  salePrice: dto.salePrice ?? null,
                  packageType,
                  serviceType,
                  isActive: dto.isActive ?? true,
                  type: typeConnect,
                  model: modelConnect,
                  capacity: capacityConnect,
                  categoryProduct: categoryProductConnect,
                  productImage:
                    (productImageRows?.length ?? 0) > 0
                      ? { create: productImageRows }
                      : undefined,
                },
              });
            });
            return created;
          }

          const created = await this.prisma.$transaction(async (tx) => {
            return tx.product.create({
              data: {
                name: dto.name,
                description: dto.description,
                price: dto.price,
                salePrice: dto.salePrice ?? null,
                packageType,
                serviceType,
                isActive: dto.isActive ?? true,
                type: typeConnect,
                model: modelConnect,
                capacity: capacityConnect,
                categoryProduct: categoryProductConnect,
                productImage:
                  (productImageRows?.length ?? 0) > 0
                    ? { create: productImageRows }
                    : undefined,
                productVariant:
                  (variants?.length ?? 0) > 0
                    ? {
                        create: variants!.map((v, idx) => ({
                          name: v.name,
                          code: v.code,
                          stock: v.stock,
                          regularPrice: v.regularPrice,
                          salePrice: v.salePrice ?? null,
                          specification: v.specification ?? null,
                          photoUrl: variantPhotoUrls?.[idx] || null,
                        })),
                      }
                    : undefined,
              },
            });
          });
          return created;
        }

        case 'BUNDLE': {
          if (!dto.bundlingItems?.length) {
            throw new CustomError({
              message: 'Bundling items wajib diisi',
              statusCode: 400,
            });
          }

          const products = await this.prisma.product.findMany({
            where: {
              uuid: { in: dto.bundlingItems.map((i) => i.productUuid) },
            },
            select: { id: true, uuid: true, price: true },
          });
          if (products.length !== dto.bundlingItems.length) {
            throw new CustomError({
              message: 'Bundling items tidak valid',
              statusCode: 400,
            });
          }

          const totalProductPrice = products.reduce(
            (sum, p) => sum + p.price,
            0,
          );
          const finalPrice = totalProductPrice - (dto.bundlingMinusPrice ?? 0);

          const bundle = await this.prisma.$transaction(async (tx) => {
            return tx.bundle.create({
              data: {
                name: dto.name,
                description: dto.description,
                minusPrice: dto.bundlingMinusPrice ?? null,
                isActive: dto.isActive ?? true,
                price: finalPrice,
                bundleImage:
                  (bundleImageRows?.length ?? 0) > 0
                    ? { create: bundleImageRows }
                    : undefined,
                items: {
                  createMany: {
                    data: products.map((p) => ({ productId: p.id })),
                  },
                },
              },
              include: {
                items: {
                  include: {
                    product: {
                      select: { uuid: true, name: true, price: true },
                    },
                  },
                },
              },
            });
          });

          return bundle;
        }

        default:
          throw new CustomError({
            message: 'Tipe produk tidak valid',
            statusCode: 400,
          });
      }
    } catch (e) {
      // jika DB gagal → hapus file yang sudah tersimpan
      await deleteFilesBestEffort(allAbsToCleanup);
      throw e;
    }
  }

  async getAll(filter: IFilterProduct) {
    return await this.productRepository.getManyPaginate({
      filter,
      select: selectGeneralProduct,
    });
  }

  async getByUuid(uuid: string) {
    const product = await this.productRepository.getThrowByUuid({
      uuid,
      select: selectGeneralProduct,
    });

    return {
      ...product,
    };
  }

  async updateProductByUuid(uuid: string, dto: UpdateProductDto) {
    // validate
    await this.productRepository.getThrowByUuid({ uuid });

    // resolve category
    const category = await this.categoryProductRepository.getThrowByUuid({
      uuid: dto.categoryProductUuid,
    });

    const {
      categoryProductUuid,
      isActive,
      productImages,
      variants,
      ...updateFields
    } = dto;

    // handle product images
    let updateProductImage: Prisma.ProductImageCreateManyProductInput[] = [];
    if (productImages?.length) {
      const uploaded = await this.productRepository.uploadBulkProductImages(
        productImages,
      );
      updateProductImage = productImages.map((item, idx) => ({
        url: typeof item === 'string' ? item : uploaded[idx]?.url,
      }));
    }

    // handle product variants
    const variantOps = variants?.length
      ? await Promise.all(
          variants.map(async (variant) => {
            let photoUrl: string | undefined;

            if (variant.image?.length) {
              const [uploaded] =
                await this.productRepository.uploadBulkProductImages([
                  variant.image[0],
                ]);
              photoUrl = uploaded.url;
            }

            const baseData = {
              name: variant.name,
              code: variant.code,
              stock: variant.stock,
              regularPrice: variant.regularPrice,
              salePrice: variant.salePrice,
              specification: variant.specification,
              ...(photoUrl ? { photoUrl } : {}),
            };

            return variant.uuid
              ? {
                  where: { uuid: variant.uuid },
                  update: baseData,
                  create: baseData,
                }
              : {
                  where: { uuid: '' },
                  update: {},
                  create: baseData,
                };
          }),
        )
      : [];

    // update product
    return this.productRepository.updateByUuid({
      uuid,
      data: {
        ...updateFields,
        isActive,
        categoryProduct: { connect: { id: category.id } },
        productImage: {
          deleteMany: {},
          ...(updateProductImage.length
            ? { createMany: { data: updateProductImage } }
            : {}),
        },
        ...(variantOps.length
          ? { productVariant: { upsert: variantOps } }
          : {}),
      },
    });
  }

  async deleteByUuid(uuid: string) {
    await this.productRepository.getThrowByUuid({ uuid });

    return await this.productRepository.updateByUuid({
      uuid,
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
