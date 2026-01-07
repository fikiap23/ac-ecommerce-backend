import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { VillageQuery } from 'src/prisma/queries/region/village.query';

@Injectable()
export class VillageRepository {
  constructor(private readonly villageQuery: VillageQuery) {}

  async create<T extends Prisma.VillageSelect>({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.VillageCreateInput;
    select?: T;
  }) {
    return await this.villageQuery.create({ tx, data, select });
  }

  async getThrowById<T extends Prisma.VillageSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const record = await this.villageQuery.findById({ tx, id, select });

    if (!record) {
      throw new RpcException({
        statusCode: 404,
        message: 'Village not found',
      });
    }

    return record as unknown as Promise<
      Prisma.VillageGetPayload<{ select: T }>
    >;
  }

  async getThrowByUuid<T extends Prisma.VillageSelect>({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: T;
  }) {
    const record = await this.villageQuery.findByUuid({ tx, uuid, select });

    if (!record) {
      throw new RpcException({
        statusCode: 404,
        message: 'Village not found',
      });
    }

    return record as unknown as Promise<
      Prisma.VillageGetPayload<{ select: T }>
    >;
  }

  async getFirst<T extends Prisma.VillageSelect>({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.VillageWhereInput;
    select?: T;
  }) {
    return await this.villageQuery.findFirst({ tx, where, select });
  }

  async getMany<T extends Prisma.VillageSelect>({
    tx,
    where,
    select,
    orderBy,
    take,
    skip,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.VillageWhereInput;
    select?: T;
    orderBy?: Prisma.VillageOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }) {
    return (await this.villageQuery.findMany({
      tx,
      where,
      select,
      orderBy,
      take,
      skip,
    })) as unknown as Promise<Prisma.VillageGetPayload<{ select: T }>[]>;
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
    where?: Prisma.VillageWhereInput;
    select?: Prisma.VillageSelect;
  }) {
    const { sort = 'desc', page = 1, limit = 10 } = filter;

    return await this.villageQuery.findManyPaginate({
      tx,
      where,
      select,
      orderBy: { id: sort },
      page,
      limit,
    });
  }

  async updateById<T extends Prisma.VillageSelect>({
    tx,
    id,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.VillageUpdateInput;
    select?: T;
  }) {
    return await this.villageQuery.updateById({ tx, id, data, select });
  }

  async deleteById<T extends Prisma.VillageSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    return await this.villageQuery.deleteById({ tx, id, select });
  }
}
