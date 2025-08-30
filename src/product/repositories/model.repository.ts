import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CustomError } from 'helpers/http.helper';
import { ModelQuery } from 'src/prisma/queries/model/model.query';

@Injectable()
export class ModelRepository {
  constructor(private readonly modelQuery: ModelQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Model Repository
    |--------------------------------------------------------------------------
    */

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.ModelCreateInput;
  }) {
    return this.modelQuery.create({
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
    select?: Prisma.ModelSelect;
  }) {
    const result = await this.modelQuery.findById({
      tx,
      id,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Model Tidak Ditemukan!',
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
    select?: Prisma.ModelSelect;
  }) {
    const result = await this.modelQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Model Tidak Ditemukan!',
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
    data: Prisma.ModelUpdateInput;
  }) {
    return this.modelQuery.update({
      tx,
      id,
      data,
    });
  }

  async deleteById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    return this.modelQuery.delete({ tx, id });
  }

  async getMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ModelWhereInput;
    select?: Prisma.ModelSelect;
  }) {
    return await this.modelQuery.findMany({ tx, where, select });
  }
}
