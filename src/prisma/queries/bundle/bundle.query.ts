// src/prisma/queries/bundle/bundle.query.ts
import { Injectable } from '@nestjs/common';
import { Prisma, Bundle } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class BundleQuery {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.BundleCreateInput;
  }): Promise<Bundle> {
    const prisma = tx ?? this.prisma;
    return prisma.bundle.create({ data });
  }

  // READ
  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.BundleSelect;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.bundle.findUnique({ where: { id }, select });
  }

  async findFirst({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.BundleWhereInput;
    select?: Prisma.BundleSelect;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.bundle.findFirst({ where, select });
  }

  async findMany({
    tx,
    where,
    select,
    orderBy,
    skip,
    take,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.BundleWhereInput;
    select?: Prisma.BundleSelect;
    orderBy?: Prisma.BundleOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.bundle.findMany({ where, select, orderBy, skip, take });
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
    where?: Prisma.BundleWhereInput;
    select?: Prisma.BundleSelect;
    orderBy?: Prisma.BundleOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this.prisma;
    return paginate(
      prisma.bundle,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async findByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.BundleSelect;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.bundle.findUnique({ where: { uuid }, select });
  }

  // UPDATE
  async updateById({
    tx,
    id,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.BundleUpdateInput;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.bundle.update({ where: { id }, data });
  }

  // SOFT DELETE (set deletedAt = now)
  async softDeleteById({
    tx,
    id,
    deletedAt = new Date(),
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    deletedAt?: Date;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.bundle.update({
      where: { id },
      data: { deletedAt },
    });
  }

  // RESTORE (set deletedAt = null)
  async restoreById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    const prisma = tx ?? this.prisma;
    return prisma.bundle.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  // HARD DELETE
  async deleteById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    const prisma = tx ?? this.prisma;
    return prisma.bundle.delete({ where: { id } });
  }
}
