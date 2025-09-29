import { Injectable } from '@nestjs/common';
import { Prisma, TypeProductService } from '@prisma/client';
import { OrderProductQuery } from 'src/prisma/queries/order/order-product.query';
import { IDeviceListFilter } from '../interfaces/order.interface';

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

  async getManyDevicePaginate({
    tx,
    filter,
    where: extraWhere,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IDeviceListFilter;
    where?: Prisma.OrderProductWhereInput;
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      orderUuid,
      orderId,
      sort = 'desc',
    } = filter;

    const where: Prisma.OrderProductWhereInput = {
      AND: [
        extraWhere,
        orderUuid ? { order: { uuid: orderUuid } } : undefined,
        orderId ? { orderId } : undefined,
        { deviceId: { not: null } },
        { order: { customerId: filter.customerId } },
        { serviceType: TypeProductService.PRODUCT },
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { variantName: { contains: search, mode: 'insensitive' } },
                { deviceId: { contains: search, mode: 'insensitive' } },
              ],
            }
          : undefined,
      ].filter(Boolean) as Prisma.OrderProductWhereInput[],
    };

    return this.orderProductQuery.findDeviceManyPaginate({
      tx,
      where,
      orderBy: { createdAt: sort },
      page,
      limit,
    });
  }

  async getManyDevice({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderProductWhereInput;
    select?: Prisma.OrderProductSelect;
  }) {
    return await this.orderProductQuery.findDeviceMany({ tx, where, select });
  }
}
