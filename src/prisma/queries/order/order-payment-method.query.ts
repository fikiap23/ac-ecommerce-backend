import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class PaymentMethodQuery extends PrismaService {
  async findManyPaginate({
    tx,
    where,
    select,
    orderBy,
    page,
    limit,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderPaymentMethodWhereInput;
    select?: Prisma.OrderPaymentMethodSelect;
    orderBy?: Prisma.OrderPaymentMethodOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return paginate(
      prisma.orderPaymentMethod,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async findMany({
    tx,
    where,
    select,
    orderBy,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderPaymentMethodWhereInput;
    select?: Prisma.OrderPaymentMethodSelect;
    orderBy?: Prisma.OrderPaymentMethodOrderByWithRelationInput;
  }) {
    const prisma = tx ?? this;
    return await prisma.orderPaymentMethod.findMany({ where, select, orderBy });
  }
}
