import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ICreateCategoryProduct,
  IUpdateCategoryProduct,
} from 'src/product/interfaces/category-product.interface';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class CategoryProductQuery extends PrismaService {
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateCategoryProduct;
  }) {
    const prisma = tx ?? this;
    return await prisma.categoryProduct.create({ data });
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
    where?: Prisma.CategoryProductWhereInput;
    select?: Prisma.CategoryProductSelect;
    orderBy?: Prisma.CategoryProductOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return paginate(
      prisma.categoryProduct,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.CategoryProductSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.categoryProduct.findUnique({
      where: { id },
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
    select?: Prisma.CategoryProductSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.categoryProduct.findUnique({
      where: { uuid },
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
    data: IUpdateCategoryProduct;
  }) {
    const prisma = tx ?? this;
    return await prisma.categoryProduct.update({ where: { uuid }, data });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    const prisma = tx ?? this;
    return await prisma.categoryProduct.delete({ where: { uuid } });
  }
}
