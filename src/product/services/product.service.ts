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

@Injectable()
export class ProductService {
  constructor(
    private readonly categoryProductRepository: CategoryProductRepository,
    private readonly productRepository: ProductRepository,
    private readonly productValidateRepository: ProductValidateRepository,
  ) {}

  async create(dto: CreateProductDto) {
    const { categoryProductUuid, productImages, variants, ...cleanDto } = dto;

    //Validate product images
    this.productValidateRepository.validateProductImages(productImages);

    //  Find category
    const categoryProduct = await this.categoryProductRepository.getThrowByUuid(
      {
        uuid: dto.categoryProductUuid,
      },
    );

    //  Upload product images
    const productImageUrls =
      await this.productRepository.uploadBulkProductImages(productImages);

    //  Variants
    const variantData: Prisma.ProductVariantCreateWithoutProductInput[] =
      variants?.length
        ? await Promise.all(
            variants.map(
              async (
                variant,
              ): Promise<Prisma.ProductVariantCreateWithoutProductInput> => {
                let photoUrl: string | undefined;

                // Upload variant images
                if (variant.image?.length) {
                  const [uploaded] =
                    await this.productRepository.uploadBulkProductImages([
                      variant.image[0],
                    ]);
                  photoUrl = uploaded.url;
                }

                return {
                  name: variant.name,
                  code: variant.code,
                  stock: variant.stock,
                  regularPrice: variant.regularPrice,
                  salePrice: variant.salePrice,
                  specification: variant.specification,
                  photoUrl,
                };
              },
            ),
          )
        : [];

    //  Create product with nested images & variants
    return await this.productRepository.create({
      data: {
        ...cleanDto,
        isActive: dto.isActive ?? true,
        categoryProduct: {
          connect: { id: categoryProduct.id },
        },
        productImage: {
          createMany: {
            data: productImageUrls,
          },
        },
        ...(variantData.length && {
          productVariant: {
            create: variantData,
          },
        }),
      },
    });
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
