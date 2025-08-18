import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomError } from 'helpers/http.helper';
import { ProductVariantQuery } from 'src/prisma/queries/product/product-variant.query';

@Injectable()
export class ProductVariantRepository {
  constructor(private readonly productVariantQuery: ProductVariantQuery) {}

  async getThrowByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.ProductVariantSelect;
  }) {
    const result = await this.productVariantQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Product Variant Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByUuidAndProductId({
    tx,
    uuid,
    productId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    productId: number;
    select?: Prisma.ProductVariantSelect;
  }) {
    const result = await this.productVariantQuery.findByUuidAndProductId({
      tx,
      uuid,
      productId,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Product Variant Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async deleteMany({
    tx,
    productId,
  }: {
    tx?: Prisma.TransactionClient;
    productId: number;
  }) {
    return await this.productVariantQuery.deleteMany({ tx, productId });
  }

  async getThrowById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.ProductVariantSelect;
  }) {
    const result = await this.productVariantQuery.findById({ tx, id, select });
    if (!result) {
      throw new CustomError({
        message: 'Product Variant Tidak Ditemukan!',
        statusCode: 404,
      });
    }
    return result;
  }
}
