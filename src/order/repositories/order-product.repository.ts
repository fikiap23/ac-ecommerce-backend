import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrderProductQuery } from 'src/prisma/queries/order/order-product.query';

@Injectable()
export class OrderProductRepository {
  constructor(private readonly orderProductQuery: OrderProductQuery) {}

  async getMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderProductWhereInput;
    select?: Prisma.OrderProductSelect;
  }) {
    return await this.orderProductQuery.findMany({ tx, where, select });
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: Prisma.OrderProductUpdateInput;
  }) {
    return await this.orderProductQuery.updateByUuid({ tx, uuid, data });
  }
}
