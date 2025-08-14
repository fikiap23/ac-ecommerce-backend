import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ICreateVoucher,
  IUpdateVoucher,
} from 'src/voucher/interfaces/voucher.interface';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class VoucherQuery extends PrismaService {
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateVoucher;
  }) {
    const prisma = tx ?? this;
    return await prisma.voucher.create({ data });
  }

  async findMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.VoucherWhereInput;
    select?: Prisma.VoucherSelect;
  }) {
    const prisma = tx ?? this;

    return await prisma.voucher.findMany({ where, select });
  }

  async findManyPaginate({
    tx,
    where,
    select,
    orderBy,
    page,
    limit,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.VoucherWhereInput;
    select?: Prisma.VoucherSelect;
    orderBy?: Prisma.VoucherOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;

    return paginate(
      prisma.voucher,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.VoucherSelect;
  }) {
    const prisma = tx ?? this;

    return await prisma.voucher.findUnique({
      where: { id },
      select,
    });
  }

  async findByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.VoucherSelect;
  }) {
    const prisma = tx ?? this;

    return await prisma.voucher.findUnique({
      where: { uuid },
      select,
    });
  }

  async updateById({
    tx,
    id,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: IUpdateVoucher;
  }) {
    const prisma = tx ?? this;
    return await prisma.voucher.update({ where: { id }, data });
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: IUpdateVoucher;
  }) {
    const prisma = tx ?? this;
    return await prisma.voucher.update({ where: { uuid }, data });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    const prisma = tx ?? this;
    return await prisma.voucher.delete({ where: { uuid } });
  }
}
