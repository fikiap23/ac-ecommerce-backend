import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { BundleQuery } from 'src/prisma/queries/bundle/bundle.query';

@Injectable()
export class BundleRepository {
  constructor(private readonly bundleQuery: BundleQuery) {}

  // CREATE
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.BundleCreateInput;
  }) {
    return await this.bundleQuery.create({ tx, data });
  }

  // READ
  async getThrowById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.BundleSelect;
  }) {
    const data = await this.bundleQuery.findById({ tx, id, select });
    if (!data) {
      throw new RpcException({ statusCode: 404, message: 'Bundle not found' });
    }
    return data;
  }

  async getThrowByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.BundleSelect;
  }) {
    const data = await this.bundleQuery.findByUuid({ tx, uuid, select });
    if (!data) {
      throw new RpcException({ statusCode: 404, message: 'Bundle not found' });
    }
    return data;
  }

  async getFirst({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.BundleWhereInput;
    select?: Prisma.BundleSelect;
  }) {
    return await this.bundleQuery.findFirst({ tx, where, select });
  }

  async getMany({
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
    return await this.bundleQuery.findMany({
      tx,
      where,
      select,
      orderBy,
      skip,
      take,
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
    data: Prisma.BundleUpdateInput;
  }) {
    return await this.bundleQuery.updateById({ tx, id, data });
  }

  // SOFT DELETE
  async softDeleteById({
    tx,
    id,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
  }) {
    return await this.bundleQuery.softDeleteById({ tx, id });
  }

  // RESTORE
  async restoreById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    return await this.bundleQuery.restoreById({ tx, id });
  }

  // HARD DELETE
  async deleteById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    return await this.bundleQuery.deleteById({ tx, id });
  }

  // Helpers opsional
  async getByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.BundleSelect;
  }) {
    return await this.bundleQuery.findByUuid({ tx, uuid, select });
  }
}
