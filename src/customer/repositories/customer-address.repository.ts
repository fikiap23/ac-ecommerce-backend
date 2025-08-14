import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomerAddressQuery } from 'src/prisma/queries/customer/customer-address.query';
import {
  ICreateCustomerAddress,
  IFilterCustomerAddress,
  IUpdateCustomerAddress,
} from '../interfaces/customer-address.interface';
import { CustomError } from 'helpers/http.helper';

@Injectable()
export class CustomerAddressRepository {
  constructor(private readonly addressQuery: CustomerAddressQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Customer Address Repository
    |--------------------------------------------------------------------------
    */

  async getThrowById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.CustomerAddressSelect;
  }) {
    const result = await this.addressQuery.findById({
      tx,
      id,
      select,
    });
    if (!result) {
      throw new CustomError({
        message: 'Customer Address Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByUuid({
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
    const result = await this.addressQuery.findByUuid({
      tx,
      addressUuid,
      customerId,
      select,
    });
    if (!result) {
      throw new CustomError({
        message: 'Customer Address Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async getMany({
    tx,
    where,
    orderBy,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.CustomerAddressWhereInput;
    orderBy?: Prisma.CustomerAddressOrderByWithRelationInput;
  }) {
    return await this.addressQuery.findMany({ tx, where, orderBy });
  }

  async getManyPaginate({
    tx,
    filter,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IFilterCustomerAddress;
    where?: Prisma.CustomerAddressWhereInput;
    select?: Prisma.CustomerAddressSelect;
  }) {
    const { sort, page, limit } = filter;

    return await this.addressQuery.findManyPaginate({
      tx,
      where,
      select,
      orderBy: { createdAt: sort },
      page,
      limit,
    });
  }

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateCustomerAddress;
  }) {
    return await this.addressQuery.create({ tx, data });
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
    return await this.addressQuery.updateByUuid({
      tx,
      addressUuid,
      customerId,
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
    return await this.addressQuery.deleteByUuid({
      tx,
      addressUuid,
      customerId,
    });
  }
}
