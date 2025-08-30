import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CustomError } from 'helpers/http.helper';
import { CapacityQuery } from 'src/prisma/queries/capacity/capacity.query';

@Injectable()
export class CapacityRepository {
  constructor(private readonly capacityQuery: CapacityQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Capacity Repository
    |--------------------------------------------------------------------------
    */

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.CapacityCreateInput;
  }) {
    return this.capacityQuery.create({
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
    select?: Prisma.CapacitySelect;
  }) {
    const result = await this.capacityQuery.findById({
      tx,
      id,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Capacity Tidak Ditemukan!',
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
    select?: Prisma.CapacitySelect;
  }) {
    const result = await this.capacityQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Capacity Tidak Ditemukan!',
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
    data: Prisma.CapacityUpdateInput;
  }) {
    return this.capacityQuery.update({
      tx,
      id,
      data,
    });
  }

  async deleteById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    return this.capacityQuery.delete({ tx, id });
  }

  async getMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.CapacityWhereInput;
    select?: Prisma.CapacitySelect;
  }) {
    return await this.capacityQuery.findMany({ tx, where, select });
  }
}
