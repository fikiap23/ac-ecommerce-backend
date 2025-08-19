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
import { ProductValidateRepository } from '../repositories/product-validate.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomError } from 'helpers/http.helper';

@Injectable()
export class ProductService {
  constructor(
    private readonly categoryProductRepository: CategoryProductRepository,
    private readonly productRepository: ProductRepository,
    private readonly productValidateRepository: ProductValidateRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateProductDto, files?: Express.Multer.File[]) {
    const { packageType, serviceType, variants, bundlingItems } = dto;

    switch (packageType) {
      case 'SINGLE': {
        if (dto.serviceType === 'SERVICE') {
          // === CREATE SINGLE SERVICE ===
          const service = await this.prisma.product.create({
            data: {
              name: dto.name,
              description: dto.description,
              price: dto.price,
              salePrice: dto.salePrice ?? null,
              packageType,
              serviceType,
              categoryProduct: {
                connect: { uuid: dto.categoryProductUuid },
              },
              isActive: dto.isActive ?? true,
              type: null,
              // TODO Upload images
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

          return service;
        }

        // === CREATE SINGLE PRODUCT ===
        const product = await this.prisma.product.create({
          data: {
            name: dto.name,
            description: dto.description,
            price: dto.price,
            salePrice: dto.salePrice ?? null,
            packageType,
            serviceType,
            categoryProduct: {
              connect: { uuid: dto.categoryProductUuid },
            },
            isActive: dto.isActive ?? true,
            // TODO Upload images
            productImage: files?.length
              ? {
                  createMany: {
                    data: files.map((f) => ({
                      url: `/uploads/${f.filename}`,
                    })),
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

        return product;
      }

      case 'BUNDLE': {
        if (!bundlingItems?.length) {
          throw new CustomError({
            message: 'Bundling item wajib diisi',
            statusCode: 400,
          });
        }

        // === CREATE BUNDLE  ===
        const bundle = await this.prisma.bundle.create({
          data: {
            name: dto.name,
            description: dto.description,
            minusPrice: dto.bundlingMinusPrice ?? null,
            isActive: dto.isActive,
            // TODO Upload images
            bundleImage: files?.length
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

        // get products
        const products = await this.prisma.product.findMany({
          where: {
            uuid: { in: bundlingItems.map((i) => i.productUuid) },
          },
          select: { id: true, uuid: true },
        });

        const productMap = new Map(products.map((p) => [p.uuid, p.id]));

        // === CONNECT ITEMS to BUNDLE ===
        await this.prisma.productBundleItem.createMany({
          data: bundlingItems.map((item) => {
            const productId = productMap.get(item.productUuid);
            if (!productId) {
              throw new CustomError({
                message: `Produk dengan uuid ${item.productUuid} tidak ditemukan`,
                statusCode: 404,
              });
            }
            return {
              bundleId: bundle.id,
              productId,
            };
          }),
        });

        return bundle;
      }

      default: {
        throw new CustomError({
          message: `Package type ${packageType} tidak dikenal`,
          statusCode: 400,
        });
      }
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
