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

  async create(dto: CreateProductDto, productImages: Express.Multer.File[]) {
    this.productValidateRepository.validateProductImages(productImages);

    const categoryProduct = await this.categoryProductRepository.getThrowByUuid(
      {
        uuid: dto.categoryProductUuid,
      },
    );

    let isActive: boolean = true;

    const productImageUrls =
      await this.productRepository.uploadBulkProductImages(productImages);

    const { categoryProductUuid, ...cleanDto } = dto;

    return await this.productRepository.create({
      data: {
        ...cleanDto,
        isActive,
        categoryProduct: {
          connect: { id: categoryProduct.id },
        },
        productImage: {
          createMany: {
            data: productImageUrls,
          },
        },
      },
    });
  }

  async getAll(filter: IFilterProduct) {
    const products = await this.productRepository.getManyPaginate({
      filter,
      select: selectGeneralProduct,
    });

    const enrichedProducts = await Promise.all(
      products.data.map(async (product: ISelectGeneralProduct) => {
        let totalStock = null;
        let mainStock = null;

        return {
          ...product,
          stock: !mainStock ? totalStock : mainStock,
        };
      }),
    );

    return {
      ...products,
      data: enrichedProducts,
    };
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

  async updateProductByUuid(
    uuid: string,
    dto: UpdateProductDto,
    productImages?: Express.Multer.File[],
  ) {
    const product = await this.productRepository.getThrowByUuid({ uuid });

    const categoryProduct = await this.categoryProductRepository.getThrowByUuid(
      {
        uuid: dto.categoryProductUuid,
      },
    );

    const { categoryProductUuid, isActive, productImageData, ...updateFields } =
      dto;

    let updateProductImage: Prisma.ProductImageCreateInput[] = (
      productImageData ?? []
    ).map((item) => ({
      url: item?.url,
      product: { connect: { id: product.id } },
    }));

    if (productImages?.length) {
      const uploaded = await this.productRepository.uploadBulkProductImages(
        productImages,
      );

      let urlIdx = 0;

      updateProductImage = updateProductImage.map((item) => {
        if (item.url === '' && urlIdx < uploaded.length) {
          item.url = uploaded[urlIdx].url;
          urlIdx++;
        }
        return item;
      });

      for (; urlIdx < uploaded.length; urlIdx++) {
        updateProductImage.push({
          url: uploaded[urlIdx].url,
          product: { connect: { id: product.id } },
        });
      }
    }

    return await this.productRepository.updateByUuid({
      uuid,
      data: {
        ...updateFields,
        isActive,
        categoryProduct: { connect: { id: categoryProduct.id } },
        productImage: {
          deleteMany: {},
          createMany: {
            data: updateProductImage.map((item) => {
              const { product, ...rest } = item;

              return rest;
            }),
          },
        },
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
