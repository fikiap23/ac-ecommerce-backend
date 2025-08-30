import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CustomError } from 'helpers/http.helper';
import { TechnicianQuery } from 'src/prisma/queries/technician/technician.query';

@Injectable()
export class TechnicianRepository {
  constructor(private readonly technicianQuery: TechnicianQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Technician Repository
    |--------------------------------------------------------------------------
    */

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.TechnicianCreateInput;
  }) {
    return this.technicianQuery.create({
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
    select?: Prisma.TechnicianSelect;
  }) {
    const result = await this.technicianQuery.findById({
      tx,
      id,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Technician Tidak Ditemukan!',
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
    select?: Prisma.TechnicianSelect;
  }) {
    const result = await this.technicianQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Technician Tidak Ditemukan!',
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
    data: Prisma.TechnicianUpdateInput;
  }) {
    return this.technicianQuery.update({
      tx,
      id,
      data,
    });
  }

  async deleteById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    return this.technicianQuery.delete({ tx, id });
  }

  async getMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.TechnicianWhereInput;
    select?: Prisma.TechnicianSelect;
  }) {
    return await this.technicianQuery.findMany({ tx, where, select });
  }
}
