import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { DistrictQuery } from 'src/prisma/queries/region/district.query';

@Injectable()
export class DistrictRepository {
  constructor(private readonly districtQuery: DistrictQuery) {}

  // CREATE
  async create<T extends Prisma.DistrictSelect>({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.DistrictCreateInput;
    select?: T;
  }) {
    return await this.districtQuery.create({ tx, data, select });
  }

  // READ
  async getThrowById<T extends Prisma.DistrictSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const record = await this.districtQuery.findById({ tx, id, select });

    if (!record) {
      throw new RpcException({
        statusCode: 404,
        message: 'District not found',
      });
    }

    return record as unknown as Promise<
      Prisma.DistrictGetPayload<{ select: T }>
    >;
  }

  async getThrowByUuid<T extends Prisma.DistrictSelect>({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: T;
  }) {
    const record = await this.districtQuery.findByUuid({ tx, uuid, select });

    if (!record) {
      throw new RpcException({
        statusCode: 404,
        message: 'District not found',
      });
    }

    return record as unknown as Promise<
      Prisma.DistrictGetPayload<{ select: T }>
    >;
  }

  async getFirst<T extends Prisma.DistrictSelect>({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.DistrictWhereInput;
    select?: T;
  }) {
    return await this.districtQuery.findFirst({ tx, where, select });
  }

  async getMany<T extends Prisma.DistrictSelect>({
    tx,
    where,
    select,
    orderBy,
    take,
    skip,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.DistrictWhereInput;
    select?: T;
    orderBy?: Prisma.DistrictOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }) {
    return (await this.districtQuery.findMany({
      tx,
      where,
      select,
      orderBy,
      take,
      skip,
    })) as unknown as Promise<Prisma.DistrictGetPayload<{ select: T }>[]>;
  }

  async getManyPaginate({
    tx,
    filter,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    filter: {
      page?: number;
      limit?: number;
      sort?: 'asc' | 'desc';
    };
    where?: Prisma.DistrictWhereInput;
    select?: Prisma.DistrictSelect;
  }) {
    const { sort = 'desc', page = 1, limit = 10 } = filter;

    return await this.districtQuery.findManyPaginate({
      tx,
      where,
      select,
      orderBy: { id: sort },
      page,
      limit,
    });
  }

  // UPDATE
  async updateById<T extends Prisma.DistrictSelect>({
    tx,
    id,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.DistrictUpdateInput;
    select?: T;
  }) {
    return await this.districtQuery.updateById({ tx, id, data, select });
  }

  // DELETE
  async deleteById<T extends Prisma.DistrictSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    return await this.districtQuery.deleteById({ tx, id, select });
  }
}
