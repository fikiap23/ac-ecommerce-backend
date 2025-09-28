import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class SiteSettingQuery {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.SiteSettingCreateInput;
  }) {
    const p = tx ?? this.prisma;
    return p.siteSetting.create({ data });
  }

  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.SiteSettingSelect;
  }) {
    const p = tx ?? this.prisma;
    return p.siteSetting.findUnique({ where: { id }, select });
  }

  async findByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.SiteSettingSelect;
  }) {
    const p = tx ?? this.prisma;
    return p.siteSetting.findUnique({ where: { uuid }, select });
  }

  async findFirst({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.SiteSettingWhereInput;
    select?: Prisma.SiteSettingSelect;
  }) {
    const p = tx ?? this.prisma;
    return p.siteSetting.findFirst({ where, select });
  }

  async findMany({
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
    const p = tx ?? this.prisma;
    return p.siteSetting.findMany({ where, select, orderBy });
  }

  async findManyPaginate({
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
    const p = tx ?? this.prisma;
    return paginate(
      p.siteSetting,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async updateById({
    tx,
    id,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.SiteSettingUpdateInput;
  }) {
    const p = tx ?? this.prisma;
    return p.siteSetting.update({ where: { id }, data });
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
    const p = tx ?? this.prisma;
    return p.siteSetting.update({ where: { uuid }, data });
  }

  async deleteById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    const p = tx ?? this.prisma;
    return p.siteSetting.delete({ where: { id } });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    const p = tx ?? this.prisma;
    return p.siteSetting.delete({ where: { uuid } });
  }
}
