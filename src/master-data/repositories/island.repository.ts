import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { IslandQuery } from 'src/prisma/queries/region/island.query';

@Injectable()
export class IslandRepository {
  constructor(private readonly islandQuery: IslandQuery) {}

  async create<T extends Prisma.IslandSelect>({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.IslandCreateInput;
    select?: T;
  }) {
    return await this.islandQuery.create({ tx, data, select });
  }

  async getThrowById<T extends Prisma.IslandSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const record = await this.islandQuery.findById({ tx, id, select });

    if (!record) {
      throw new RpcException({
        statusCode: 404,
        message: 'Island not found',
      });
    }

    return record as unknown as Promise<Prisma.IslandGetPayload<{ select: T }>>;
  }

  async getThrowByUuid<T extends Prisma.IslandSelect>({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: T;
  }) {
    const record = await this.islandQuery.findByUuid({ tx, uuid, select });

    if (!record) {
      throw new RpcException({
        statusCode: 404,
        message: 'Island not found',
      });
    }

    return record as unknown as Promise<Prisma.IslandGetPayload<{ select: T }>>;
  }

  async getFirst<T extends Prisma.IslandSelect>({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.IslandWhereInput;
    select?: T;
  }) {
    return await this.islandQuery.findFirst({ tx, where, select });
  }

  async getMany<T extends Prisma.IslandSelect>({
    tx,
    where,
    select,
    orderBy,
    take,
    skip,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.IslandWhereInput;
    select?: T;
    orderBy?: Prisma.IslandOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }) {
    return (await this.islandQuery.findMany({
      tx,
      where,
      select,
      orderBy,
      take,
      skip,
    })) as unknown as Promise<Prisma.IslandGetPayload<{ select: T }>[]>;
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
    where?: Prisma.IslandWhereInput;
    select?: Prisma.IslandSelect;
  }) {
    const { sort = 'desc', page = 1, limit = 10 } = filter;

    return await this.islandQuery.findManyPaginate({
      tx,
      where,
      select,
      orderBy: { id: sort },
      page,
      limit,
    });
  }

  async updateById<T extends Prisma.IslandSelect>({
    tx,
    id,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.IslandUpdateInput;
    select?: T;
  }) {
    return await this.islandQuery.updateById({ tx, id, data, select });
  }

  async deleteById<T extends Prisma.IslandSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    return await this.islandQuery.deleteById({ tx, id, select });
  }
}
