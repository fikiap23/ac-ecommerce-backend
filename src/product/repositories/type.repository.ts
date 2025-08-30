import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CustomError } from 'helpers/http.helper';
import { TypeQuery } from 'src/prisma/queries/type/type.query';

@Injectable()
export class TypeRepository {
  constructor(private readonly typeQuery: TypeQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Type Repository
    |--------------------------------------------------------------------------
    */

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.TypeCreateInput;
  }) {
    return this.typeQuery.create({
      tx,
      data,
    });
  }

  async getThrowById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.TypeSelect;
  }) {
    const result = await this.typeQuery.findById({
      tx,
      id,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Type Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.TypeSelect;
  }) {
    const result = await this.typeQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Type Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async updateById({
    tx,
    id,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.TypeUpdateInput;
  }) {
    return this.typeQuery.update({
      tx,
      id,
      data,
    });
  }

  async deleteById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    return this.typeQuery.delete({ tx, id });
  }

  async getMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.TypeWhereInput;
    select?: Prisma.TypeSelect;
  }) {
    return await this.typeQuery.findMany({ tx, where, select });
  }
}
