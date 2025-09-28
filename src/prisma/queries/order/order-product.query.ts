import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';
import { selectOrderProductDevice } from './props/select-order.prop';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class OrderProductQuery extends PrismaService {
  async findMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderProductWhereInput;
    select?: Prisma.OrderProductSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.orderProduct.findMany({ where, select });
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
    const prisma = tx ?? this;
    return await prisma.orderProduct.update({ where: { uuid }, data });
  }

  async findDeviceManyPaginate({
    tx,
    where,
    orderBy,
    page = 1,
    limit = 10,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderProductWhereInput;
    orderBy?: Prisma.OrderProductOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return paginate(
      prisma.orderProduct,
      { where, select: selectOrderProductDevice, orderBy },
      { page, perPage: limit },
    );
  }
}
