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

  async create(dto: CreateProductDto, files?: Express.Multer.File[]) {
    const {
      packageType,
      serviceType,
      variants,
      bundlingItems,
      typeUuid,
      modelUuid,
      capacityUuid,
    } = dto;

    // === VALIDASI TYPE, MODEL, CAPACITY ===
    let typeConnect = undefined;
    let modelConnect = undefined;
    let capacityConnect = undefined;
    let categoryProductConnect = undefined;

    if (typeUuid) {
      await this.typeRepository.getThrowByUuid({
        uuid: typeUuid,
      });

      typeConnect = { connect: { uuid: typeUuid } };
    }

    if (modelUuid) {
      await this.modelRepository.getThrowByUuid({
        uuid: modelUuid,
      });

      modelConnect = { connect: { uuid: modelUuid } };
    }

    if (capacityUuid) {
      await this.capacityRepository.getThrowByUuid({
        uuid: capacityUuid,
      });

      capacityConnect = { connect: { uuid: capacityUuid } };
    }

    // === VALIDASI CATEGORY PRODUCT ===

    if (dto.categoryProductUuid) {
      await this.categoryProductRepository.getThrowByUuid({
        uuid: dto.categoryProductUuid,
      });
      categoryProductConnect = { connect: { uuid: dto.categoryProductUuid } };
    }

    // === CREATE PRODUCT / SERVICE / BUNDLE ===
    switch (packageType) {
      case 'SINGLE':
        if (serviceType === 'SERVICE') {
          return await this.prisma.product.create({
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
              productImage: files?.length
                ? {
                    createMany: {
                      data: files.map((f) => ({
                        url: `/uploads/${f.filename}`,
                      })),
                    },
                  }
                : undefined,
            },
          });
        }

        // SINGLE PRODUCT
        return await this.prisma.product.create({
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
            productImage: files?.length
              ? {
                  createMany: {
                    data: files.map((f) => ({ url: `/uploads/${f.filename}` })),
                  },
                }
              : undefined,
            productVariant: variants?.length
              ? {
                  createMany: {
                    data: variants.map((v) => ({
                      name: v.name,
                      code: v.code,
                      stock: v.stock,
                      regularPrice: v.regularPrice,
                      salePrice: v.salePrice ?? null,
                      specification: v.specification ?? null,
                    })),
                  },
                }
              : undefined,
          },
        });

      case 'BUNDLE': {
        if (!bundlingItems?.length) {
          throw new CustomError({
            message: 'Bundling item wajib diisi',
            statusCode: 400,
          });
        }

        // === Ambil produk yang ada ===
        const products = await this.prisma.product.findMany({
          where: {
            uuid: { in: bundlingItems.map((i) => i.productUuid) },
          },
          select: { id: true, uuid: true, price: true },
        });

        if (products.length !== bundlingItems.length) {
          throw new CustomError({
            message: 'Salah satu produk tidak ditemukan',
            statusCode: 404,
          });
        }

        // === Hitung total harga bundle ===
        const totalProductPrice = products.reduce((sum, p) => sum + p.price, 0);
        const finalPrice = totalProductPrice - (dto.bundlingMinusPrice ?? 0);

        // === CREATE BUNDLE SEKALIGUS DENGAN ITEMS ===
        const bundle = await this.prisma.bundle.create({
          data: {
            name: dto.name,
            description: dto.description,
            minusPrice: dto.bundlingMinusPrice ?? null,
            isActive: dto.isActive,
            price: finalPrice,
            bundleImage: files?.length
              ? {
                  createMany: {
                    data: files.map((f) => ({
                      url: `/uploads/${f.filename}`,
                    })),
                  },
                }
              : undefined,
            items: {
              createMany: {
                data: products.map((p) => ({
                  productId: p.id,
                })),
              },
            },
          },
          include: {
            items: {
              include: {
                product: { select: { uuid: true, name: true, price: true } },
              },
            },
          },
        });

        return bundle;
      }

      default:
        throw new CustomError({
          message: `Package type ${packageType} tidak dikenal`,
          statusCode: 400,
        });
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
