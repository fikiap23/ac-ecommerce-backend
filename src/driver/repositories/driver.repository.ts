import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CustomError } from 'helpers/http.helper';
import { DriverQuery } from 'src/prisma/queries/driver/driver.query';

@Injectable()
export class DriverRepository {
  constructor(private readonly driverQuery: DriverQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Driver Repository
    |--------------------------------------------------------------------------
    */

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.DriverCreateInput;
  }) {
    return this.driverQuery.create({
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
    select?: Prisma.DriverSelect;
  }) {
    const result = await this.driverQuery.findById({
      tx,
      id,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Driver Tidak Ditemukan!',
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
    select?: Prisma.DriverSelect;
  }) {
    const result = await this.driverQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Driver Tidak Ditemukan!',
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
    data: Prisma.DriverUpdateInput;
  }) {
    return this.driverQuery.update({
      tx,
      id,
      data,
    });
  }

  async deleteById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    return this.driverQuery.delete({ tx, id });
  }

  async getMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.DriverWhereInput;
    select?: Prisma.DriverSelect;
  }) {
    return await this.driverQuery.findMany({ tx, where, select });
  }
}
