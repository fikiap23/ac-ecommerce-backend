import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from '../../paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ICreateCustomer,
  IUpdateCustomer,
} from 'src/customer/interfaces/customer.interface';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class CustomerQuery extends PrismaService {
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateCustomer;
  }) {
    const prisma = tx ?? this;
    return await prisma.customer.create({ data });
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
    where?: Prisma.CustomerWhereInput;
    select?: Prisma.CustomerSelect;
    orderBy?: Prisma.CustomerOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return paginate(
      prisma.customer,
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
    select?: Prisma.CustomerSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.customer.findUnique({
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
    select?: Prisma.CustomerSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.customer.findUnique({
      where: { uuid },
      select,
    });
  }

  async findByEmail({
    tx,
    email,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    email: string;
    select?: Prisma.CustomerSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.customer.findUnique({
      where: { email },
      select,
    });
  }

  async updateById({
    tx,
    id,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: IUpdateCustomer;
  }) {
    const prisma = tx ?? this;
    return await prisma.customer.update({ where: { id }, data });
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: IUpdateCustomer;
  }) {
    const prisma = tx ?? this;
    return await prisma.customer.update({ where: { uuid }, data });
  }

  async updateByEmail({
    tx,
    email,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    email: string;
    data: IUpdateCustomer;
  }) {
    const prisma = tx ?? this;
    return await prisma.customer.update({ where: { email }, data });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    const prisma = tx ?? this;
    return await prisma.customer.delete({ where: { uuid } });
  }

  async isEmailUnique({
    tx,
    email,
    excludeUuid,
  }: {
    tx?: Prisma.TransactionClient;
    email: string;
    excludeUuid?: string;
  }) {
    const prisma = tx ?? this;

    const existingUser = await prisma.customer.findFirst({
      where: {
        email,
        ...(excludeUuid && {
          uuid: {
            not: excludeUuid,
          },
        }),
      },
      select: { id: true },
    });

    return existingUser;
  }

  async isPhoneNumberUnique({
    tx,
    phoneNumber,
    excludeUuid,
  }: {
    tx?: Prisma.TransactionClient;
    phoneNumber: string;
    excludeUuid?: string;
  }) {
    const prisma = tx ?? this;

    const existingUser = await prisma.customer.findFirst({
      where: {
        phoneNumber,
        ...(excludeUuid && {
          uuid: {
            not: excludeUuid,
          },
        }),
      },
      select: { id: true },
    });

    return existingUser;
  }
}
