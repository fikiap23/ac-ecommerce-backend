import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductImageQuery } from 'src/prisma/queries/product/product-image.query';

@Injectable()
export class ProductImageRepository {
  constructor(private readonly productImageQuery: ProductImageQuery) {}

  async deleteMany({
    tx,
    productId,
  }: {
    tx?: Prisma.TransactionClient;
    productId: number;
  }) {
    return await this.productImageQuery.deleteMany({
      tx,
      productId,
    });
  }

  async count({
    tx,
    where,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ProductImageWhereInput;
  }) {
    return await this.productImageQuery.count({ tx, where });
  }
}
