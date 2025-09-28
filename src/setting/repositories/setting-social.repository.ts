import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { SettingSocialQuery } from 'src/prisma/queries/setting/setting-social.query';

@Injectable()
export class SettingSocialRepository {
  constructor(private readonly settingSocialQuery: SettingSocialQuery) {}

  // CREATE
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.SettingSocialCreateInput;
  }) {
    return this.settingSocialQuery.create({ tx, data });
  }

  // READ
  async getThrowById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.SettingSocialSelect;
  }) {
    const row = await this.settingSocialQuery.findById({ tx, id, select });
    if (!row) {
      throw new RpcException({
        statusCode: 404,
        message: 'SettingSocial not found',
      });
    }
    return row;
  }

  async getThrowByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.SettingSocialSelect;
  }) {
    const row = await this.settingSocialQuery.findByUuid({ tx, uuid, select });
    if (!row) {
      throw new RpcException({
        statusCode: 404,
        message: 'SettingSocial not found',
      });
    }
    return row;
  }

  async getFirst({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.SettingSocialWhereInput;
    select?: Prisma.SettingSocialSelect;
  }) {
    return this.settingSocialQuery.findFirst({ tx, where, select });
  }

  async getMany({
    tx,
    where,
    select,
    orderBy,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.SettingSocialWhereInput;
    select?: Prisma.SettingSocialSelect;
    orderBy?: Prisma.SettingSocialOrderByWithRelationInput;
  }) {
    return this.settingSocialQuery.findMany({ tx, where, select, orderBy });
  }

  async getManyPaginate({
    tx,
    where,
    select,
    orderBy,
    page = 1,
    limit = 10,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.SettingSocialWhereInput;
    select?: Prisma.SettingSocialSelect;
    orderBy?: Prisma.SettingSocialOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    return this.settingSocialQuery.findManyPaginate({
      tx,
      where,
      select,
      orderBy,
      page,
      limit,
    });
  }

  // UPDATE
  async updateById({
    tx,
    id,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.SettingSocialUpdateInput;
  }) {
    return this.settingSocialQuery.updateById({ tx, id, data });
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: Prisma.SettingSocialUpdateInput;
  }) {
    return this.settingSocialQuery.updateByUuid({ tx, uuid, data });
  }

  // DELETE
  async deleteById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    return this.settingSocialQuery.deleteById({ tx, id });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    return this.settingSocialQuery.deleteByUuid({ tx, uuid });
  }
}
