import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class IslandQuery {
  constructor(private readonly prisma: PrismaService) {}

  async create<T extends Prisma.IslandSelect>({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.IslandCreateInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.island.create({
      data,
      select,
    }) as Promise<Prisma.IslandGetPayload<{ select: T }>>;
  }

  async findById<T extends Prisma.IslandSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.island.findUnique({
      where: { id },
      select,
    }) as Promise<Prisma.IslandGetPayload<{ select: T }>>;
  }

  async findByUuid<T extends Prisma.IslandSelect>({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.island.findUnique({
      where: { uuid },
      select,
    }) as Promise<Prisma.IslandGetPayload<{ select: T }>>;
  }

  async findFirst<T extends Prisma.IslandSelect>({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.IslandWhereInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.island.findFirst({
      where,
      select,
    }) as Promise<Prisma.IslandGetPayload<{ select: T }>>;
  }

  async findMany<T extends Prisma.IslandSelect>({
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
    const prisma = tx ?? this.prisma;
    return prisma.island.findMany({
      where,
      select,
      orderBy,
      take,
      skip,
    }) as Promise<Prisma.IslandGetPayload<{ select: T }>[]>;
  }

  async findManyPaginate<T extends Prisma.IslandSelect>({
    tx,
    where,
    select,
    orderBy,
    page = 1,
    limit = 10,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.IslandWhereInput;
    select?: T;
    orderBy?: Prisma.IslandOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this.prisma;
    return paginate(
      prisma.island,
      { where, select, orderBy },
      { page, perPage: limit },
    );
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
    const prisma = tx ?? this.prisma;
    return prisma.island.update({
      where: { id },
      data,
      select,
    }) as Promise<Prisma.IslandGetPayload<{ select: T }>>;
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
    const prisma = tx ?? this.prisma;
    return prisma.island.delete({
      where: { id },
      select,
    }) as Promise<Prisma.IslandGetPayload<{ select: T }>>;
  }
}
