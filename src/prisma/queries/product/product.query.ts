import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ICreateProduct,
  IUpdateProduct,
} from 'src/product/interfaces/product.interface';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class ProductQuery extends PrismaService {
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateProduct;
  }) {
    const prisma = tx ?? this;
    return await prisma.product.create({ data });
  }

  async findMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ProductWhereInput;
    select?: Prisma.ProductSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.product.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      select,
    });
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
    where?: Prisma.ProductWhereInput;
    select?: Prisma.ProductSelect;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return paginate(
      prisma.product,
      {
        where: {
          ...where,
          deletedAt: null,
        },
        select,
        orderBy,
      },
      { page, perPage: limit },
    );
  }

  async findByUnique({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ProductWhereUniqueInput;
    select?: Prisma.ProductSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.product.findUnique({
      where: { ...where, deletedAt: null },
      select,
    });
  }

  async findByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.ProductSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.product.findUnique({
      where: { uuid, deletedAt: null },
      select,
    });
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: IUpdateProduct;
  }) {
    const prisma = tx ?? this;

    return await prisma.product.update({
      where: { uuid, deletedAt: null },
      data,
    });
  }
}
