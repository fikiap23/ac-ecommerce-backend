import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { SiteSettingQuery } from 'src/prisma/queries/setting/site-setting.query';

@Injectable()
export class SiteSettingRepository {
  constructor(private readonly siteSettingQuery: SiteSettingQuery) {}

  // CREATE
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.SiteSettingCreateInput;
  }) {
    return this.siteSettingQuery.create({ tx, data });
  }

  // READ
  async getThrowById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.SiteSettingSelect;
  }) {
    const row = await this.siteSettingQuery.findById({ tx, id, select });
    if (!row) {
      throw new RpcException({
        statusCode: 404,
        message: 'SiteSetting not found',
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
    select?: Prisma.SiteSettingSelect;
  }) {
    const row = await this.siteSettingQuery.findByUuid({ tx, uuid, select });
    if (!row) {
      throw new RpcException({
        statusCode: 404,
        message: 'SiteSetting not found',
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
    where?: Prisma.SiteSettingWhereInput;
    select?: Prisma.SiteSettingSelect;
  }) {
    return this.siteSettingQuery.findFirst({ tx, where, select });
  }

  async getMany({
    tx,
    where,
    select,
    orderBy,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.SiteSettingWhereInput;
    select?: Prisma.SiteSettingSelect;
    orderBy?: Prisma.SiteSettingOrderByWithRelationInput;
  }) {
    return this.siteSettingQuery.findMany({ tx, where, select, orderBy });
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
    where?: Prisma.SiteSettingWhereInput;
    select?: Prisma.SiteSettingSelect;
    orderBy?: Prisma.SiteSettingOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    return this.siteSettingQuery.findManyPaginate({
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
    data: Prisma.SiteSettingUpdateInput;
  }) {
    return this.siteSettingQuery.updateById({ tx, id, data });
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: Prisma.SiteSettingUpdateInput;
  }) {
    return this.siteSettingQuery.updateByUuid({ tx, uuid, data });
  }

  // DELETE
  async deleteById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    return this.siteSettingQuery.deleteById({ tx, id });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    return this.siteSettingQuery.deleteByUuid({ tx, uuid });
  }
}
