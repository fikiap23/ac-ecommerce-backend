import { Injectable } from '@nestjs/common';
import { Prisma, TypeProductService, TypeStatusOrder } from '@prisma/client';
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
      customerId,
    } = filter;

    const where: Prisma.OrderProductWhereInput = {
      AND: [
        extraWhere,
        orderUuid ? { order: { uuid: orderUuid } } : undefined,
        orderId ? { orderId } : undefined,
        { deviceId: { not: null } },
        {
          order: {
            customerId,
            status: { not: TypeStatusOrder.CANCELLED },
          },
        },
        {
          OR: [
            { serviceType: TypeProductService.PRODUCT },
            {
              serviceType: TypeProductService.SERVICE,
              isDeviceOutside: true,
            },
          ],
        },
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

    const rows = await this.orderProductQuery.findMany({
      tx,
      where,
      orderBy: { createdAt: sort },
    });

    const uniqueRows = this.filterUniqueDevice(rows);

    const total = uniqueRows.length;
    const lastPage = Math.ceil(total / limit);

    const currentPage = Math.max(1, page);
    const start = (currentPage - 1) * limit;
    const end = start + limit;

    const data = uniqueRows.slice(start, end);

    return {
      data,
      meta: {
        total,
        lastPage,
        currentPage,
        perPage: limit,
        prev: currentPage > 1 ? currentPage - 1 : null,
        next: currentPage < lastPage ? currentPage + 1 : null,
      },
    };
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

  private filterUniqueDevice(
    rows: Array<{
      deviceId: string | null;
      isDeviceOutside: boolean;
    }>,
  ) {
    const map = new Map<string, (typeof rows)[number]>();

    for (const row of rows) {
      if (!row.deviceId) continue;

      const existing = map.get(row.deviceId);

      if (!existing) {
        map.set(row.deviceId, row);
        continue;
      }

      // prioritaskan isDeviceOutside = true
      if (!existing.isDeviceOutside && row.isDeviceOutside) {
        map.set(row.deviceId, row);
      }
    }

    return Array.from(map.values());
  }
}
