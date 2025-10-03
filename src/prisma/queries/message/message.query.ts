import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});
@Injectable()
export class MessageQuery extends PrismaService {
  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.MessageSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.message.findUnique({
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
    select?: Prisma.MessageSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.message.findUnique({
      where: { uuid },
      select,
    });
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
    where?: Prisma.MessageWhereInput;
    select?: Prisma.MessageSelect;
    orderBy?: Prisma.MessageOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    const prisma = tx ?? this;
    return prisma.message.findMany({
      where,
      select,
      orderBy,
      skip,
      take,
    });
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
    where?: Prisma.MessageWhereInput;
    select?: Prisma.MessageSelect;
    orderBy?: Prisma.MessageOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return paginate(
      prisma.message,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async create({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.MessageCreateInput;
    select?: Prisma.MessageSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.message.create({
      data,
      select,
    });
  }

  async update({
    tx,
    id,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.MessageUpdateInput;
    select?: Prisma.MessageSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.message.update({
      where: { id },
      data,
      select,
    });
  }

  async delete({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    const prisma = tx ?? this;
    return prisma.message.delete({
      where: { id },
    });
  }
}
