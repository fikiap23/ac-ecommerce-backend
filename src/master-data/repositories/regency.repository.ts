import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { RegencyQuery } from 'src/prisma/queries/region/regency.query';

@Injectable()
export class RegencyRepository {
  constructor(private readonly regencyQuery: RegencyQuery) {}

  async create<T extends Prisma.RegencySelect>({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.RegencyCreateInput;
    select?: T;
  }) {
    return await this.regencyQuery.create({ tx, data, select });
  }

  async getThrowById<T extends Prisma.RegencySelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const record = await this.regencyQuery.findById({ tx, id, select });

    if (!record) {
      throw new RpcException({
        statusCode: 404,
        message: 'Regency not found',
      });
    }

    return record as unknown as Promise<
      Prisma.RegencyGetPayload<{ select: T }>
    >;
  }

  async getThrowByUuid<T extends Prisma.RegencySelect>({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: T;
  }) {
    const record = await this.regencyQuery.findByUuid({ tx, uuid, select });

    if (!record) {
      throw new RpcException({
        statusCode: 404,
        message: 'Regency not found',
      });
    }

    return record as unknown as Promise<
      Prisma.RegencyGetPayload<{ select: T }>
    >;
  }

  async getFirst<T extends Prisma.RegencySelect>({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.RegencyWhereInput;
    select?: T;
  }) {
    return await this.regencyQuery.findFirst({ tx, where, select });
  }

  async getMany<T extends Prisma.RegencySelect>({
    tx,
    where,
    select,
    orderBy,
    take,
    skip,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.RegencyWhereInput;
    select?: T;
    orderBy?: Prisma.RegencyOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }) {
    return (await this.regencyQuery.findMany({
      tx,
      where,
      select,
      orderBy,
      take,
      skip,
    })) as unknown as Promise<Prisma.RegencyGetPayload<{ select: T }>[]>;
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
    where?: Prisma.RegencyWhereInput;
    select?: Prisma.RegencySelect;
  }) {
    const { sort = 'desc', page = 1, limit = 10 } = filter;

    return await this.regencyQuery.findManyPaginate({
      tx,
      where,
      select,
      orderBy: { id: sort },
      page,
      limit,
    });
  }

  async updateById<T extends Prisma.RegencySelect>({
    tx,
    id,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.RegencyUpdateInput;
    select?: T;
  }) {
    return await this.regencyQuery.updateById({ tx, id, data, select });
  }

  async deleteById<T extends Prisma.RegencySelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    return await this.regencyQuery.deleteById({ tx, id, select });
  }
}
