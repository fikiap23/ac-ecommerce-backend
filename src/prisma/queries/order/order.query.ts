import { Injectable } from '@nestjs/common';
import { Prisma, TypeStatusOrder } from '@prisma/client';
import { ICreateOrder } from 'src/order/interfaces/order.interface';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class OrderQuery extends PrismaService {
  async create({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateOrder;
    select?: Prisma.OrderSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.order.create({ data, select });
  }

  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.OrderSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.order.findUnique({ where: { id }, select });
  }

  async findByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.OrderSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.order.findUnique({ where: { uuid }, select });
  }

  async findByTrackId({
    tx,
    trackId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    trackId: string;
    select?: Prisma.OrderSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.order.findUnique({ where: { trackId }, select });
  }

  async findByTrackIdAndStatus({
    tx,
    trackId,
    status,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    trackId: string;
    status: TypeStatusOrder;
    select?: Prisma.OrderSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.order.findFirst({ where: { trackId, status }, select });
  }

  async findByUuidAndCustomerId({
    tx,
    uuid,
    customerId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    customerId: number;
    select?: Prisma.OrderSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.order.findFirst({
      where: { uuid, customerId },
      select,
    });
  }

  async findMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderWhereInput;
    select?: Prisma.OrderSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.order.findMany({ where, select });
  }

  async findManyPaginate({
    tx,
    where,
    select,
    orderBy,
    page,
    limit,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderWhereInput;
    select?: Prisma.OrderSelect;
    orderBy?: Prisma.OrderOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return await paginate(
      prisma.order,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async update({
    tx,
    where,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    where: Prisma.OrderWhereUniqueInput;
    data: Prisma.OrderUpdateInput;
  }) {
    const prisma = tx ?? this;
    return await prisma.order.update({ where, data });
  }

  async count({
    tx,
    where,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderWhereInput;
  }) {
    const prisma = tx ?? this;
    return await prisma.order.count({ where });
  }

  async aggregate({
    tx,
    where,
    _sum,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderWhereInput;
    _sum?: Prisma.OrderSumAggregateInputType;
  }) {
    const prisma = tx ?? this;
    return await prisma.order.aggregate({ where, _sum });
  }

  async groupBy({
    tx,
    by,
    _count,
    where,
    _sum,
  }: {
    tx?: Prisma.TransactionClient;
    by: Prisma.OrderScalarFieldEnum[];
    _count?: Prisma.OrderCountAggregateInputType;
    where?: Prisma.OrderWhereInput;
    _sum?: Prisma.OrderSumAggregateInputType;
  }) {
    const prisma = tx ?? this;

    return await prisma.order.groupBy({
      ...(by && { by }),
      ...(where && { where }),
      ...(_count && { _count }),
      ...(_sum && { _sum }),
    });
  }
}
