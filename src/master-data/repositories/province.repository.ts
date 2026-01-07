import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { ProvinceQuery } from 'src/prisma/queries/region/province.query';

@Injectable()
export class ProvinceRepository {
  constructor(private readonly provinceQuery: ProvinceQuery) {}

  // CREATE
  async create<T extends Prisma.ProvinceSelect>({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.ProvinceCreateInput;
    select?: T;
  }) {
    return await this.provinceQuery.create({ tx, data, select });
  }

  // READ
  async getThrowById<T extends Prisma.ProvinceSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const record = await this.provinceQuery.findById({
      tx,
      id,
      select,
    });

    if (!record) {
      throw new RpcException({
        statusCode: 404,
        message: 'Province not found',
      });
    }

    return record as unknown as Promise<
      Prisma.ProvinceGetPayload<{ select: T }>
    >;
  }

  async getThrowByUuid<T extends Prisma.ProvinceSelect>({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: T;
  }) {
    const record = await this.provinceQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!record) {
      throw new RpcException({
        statusCode: 404,
        message: 'Province not found',
      });
    }

    return record as unknown as Promise<
      Prisma.ProvinceGetPayload<{ select: T }>
    >;
  }

  async getFirst<T extends Prisma.ProvinceSelect>({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ProvinceWhereInput;
    select?: T;
  }) {
    return await this.provinceQuery.findFirst({
      tx,
      where,
      select,
    });
  }

  async getMany<T extends Prisma.ProvinceSelect>({
    tx,
    where,
    select,
    orderBy,
    take,
    skip,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ProvinceWhereInput;
    select?: T;
    orderBy?: Prisma.ProvinceOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }) {
    return (await this.provinceQuery.findMany({
      tx,
      where,
      select,
      orderBy,
      take,
      skip,
    })) as unknown as Promise<Prisma.ProvinceGetPayload<{ select: T }>[]>;
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
    where?: Prisma.ProvinceWhereInput;
    select?: Prisma.ProvinceSelect;
  }) {
    const { sort = 'desc', page = 1, limit = 10 } = filter;

    return await this.provinceQuery.findManyPaginate({
      tx,
      where,
      select,
      orderBy: {
        id: sort,
      },
      page,
      limit,
    });
  }

  // UPDATE
  async updateById<T extends Prisma.ProvinceSelect>({
    tx,
    id,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.ProvinceUpdateInput;
    select?: T;
  }) {
    return await this.provinceQuery.updateById({
      tx,
      id,
      data,
      select,
    });
  }

  // DELETE
  async deleteById<T extends Prisma.ProvinceSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    return await this.provinceQuery.deleteById({
      tx,
      id,
      select,
    });
  }
}
