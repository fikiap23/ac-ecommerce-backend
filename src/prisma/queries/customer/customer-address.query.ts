import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ICreateCustomerAddress,
  IUpdateCustomerAddress,
} from 'src/customer/interfaces/customer-address.interface';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class CustomerAddressQuery extends PrismaService {
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateCustomerAddress;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerAddress.create({ data });
  }

  async findMany({
    tx,
    where,
    select,
    orderBy,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.CustomerAddressWhereInput;
    select?: Prisma.CustomerAddressSelect;
    orderBy?: Prisma.CustomerAddressOrderByWithRelationInput;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerAddress.findMany({ where, select, orderBy });
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
    where?: Prisma.CustomerAddressWhereInput;
    select?: Prisma.CustomerAddressSelect;
    orderBy?: Prisma.CustomerAddressOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return paginate(
      prisma.customerAddress,
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
    select?: Prisma.CustomerAddressSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerAddress.findUnique({
      where: { id },
      select,
    });
  }

  async findByUuid({
    tx,
    addressUuid,
    customerId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    addressUuid: string;
    customerId: number;
    select?: Prisma.CustomerAddressSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerAddress.findUnique({
      where: { uuid: addressUuid, customerId },
      select,
    });
  }

  async updateByUuid({
    tx,
    addressUuid,
    customerId,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    addressUuid: string;
    customerId: number;
    data: IUpdateCustomerAddress;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerAddress.update({
      where: { uuid: addressUuid, customerId },
      data,
    });
  }

  async deleteByUuid({
    tx,
    addressUuid,
    customerId,
  }: {
    tx?: Prisma.TransactionClient;
    addressUuid: string;
    customerId: number;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerAddress.delete({
      where: { uuid: addressUuid, customerId },
    });
  }
}
