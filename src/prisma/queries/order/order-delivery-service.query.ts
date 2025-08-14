import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class DeliveryServiceQuery extends PrismaService {
  async findManyPaginate({
    tx,
    where,
    select,
    orderBy,
    page,
    limit,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderDeliveryServiceWhereInput;
    select?: Prisma.OrderDeliveryServiceSelect;
    orderBy?: Prisma.OrderDeliveryServiceOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return paginate(
      prisma.orderDeliveryService,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }
}
