import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ICreateCustomerProduct,
  IUpdateCustomerProduct,
} from 'src/customer/interfaces/customer-product.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomerProductQuery extends PrismaService {
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateCustomerProduct;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerProduct.create({ data });
  }

  async findMany({
    tx,
    where,
    select,
    orderBy,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.CustomerProductWhereInput;
    select?: Prisma.CustomerProductSelect;
    orderBy?: Prisma.CustomerProductOrderByWithRelationInput;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerProduct.findMany({ where, select, orderBy });
  }

  async findByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.CustomerProductSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerProduct.findUnique({ where: { uuid }, select });
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: IUpdateCustomerProduct;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerProduct.update({ where: { uuid }, data });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerProduct.delete({ where: { uuid } });
  }

  async deleteMany({
    tx,
    where,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.CustomerProductWhereInput;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerProduct.deleteMany({ where });
  }

  async findOne({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.CustomerProductWhereInput;
    select?: Prisma.CustomerProductSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerProduct.findFirst({ where, select });
  }
}
