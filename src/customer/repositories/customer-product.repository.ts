import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomerProductQuery } from 'src/prisma/queries/customer/customer-product.query';
import {
  ICreateCustomerProduct,
  IUpdateCustomerProduct,
} from '../interfaces/customer-product.interface';
import { CustomError } from 'helpers/http.helper';

@Injectable()
export class CustomerProductRepository {
  constructor(private readonly customerProductQuery: CustomerProductQuery) {}
  /*
    |--------------------------------------------------------------------------
    | Customer Product Repository
    |--------------------------------------------------------------------------
    */

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateCustomerProduct;
  }) {
    return await this.customerProductQuery.create({ tx, data });
  }

  async getMany<T extends Prisma.CustomerProductSelect>({
    tx,
    where,
    select,
    orderBy,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.CustomerProductWhereInput;
    select?: T;
    orderBy?: Prisma.CustomerProductOrderByWithRelationInput;
  }) {
    return (await this.customerProductQuery.findMany({
      tx,
      where,
      select,
      orderBy,
    })) as unknown as Promise<
      Prisma.CustomerProductGetPayload<{ select: T }>[]
    >;
  }

  async getThrowByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.CustomerProductSelect;
  }) {
    const result = await this.customerProductQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Customer Product Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
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
    return await this.customerProductQuery.updateByUuid({ tx, uuid, data });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    return await this.customerProductQuery.deleteByUuid({ tx, uuid });
  }

  async deleteMany({
    tx,
    where,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.CustomerProductWhereInput;
  }) {
    return await this.customerProductQuery.deleteMany({ tx, where });
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
    return await this.customerProductQuery.findOne({ tx, where, select });
  }
}
