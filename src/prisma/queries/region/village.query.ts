import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class VillageQuery {
  constructor(private readonly prisma: PrismaService) {}

  async create<T extends Prisma.VillageSelect>({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.VillageCreateInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.village.create({
      data,
      select,
    }) as Promise<Prisma.VillageGetPayload<{ select: T }>>;
  }

  async findById<T extends Prisma.VillageSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.village.findUnique({
      where: { id },
      select,
    }) as Promise<Prisma.VillageGetPayload<{ select: T }>>;
  }

  async findByUuid<T extends Prisma.VillageSelect>({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.village.findUnique({
      where: { uuid },
      select,
    }) as Promise<Prisma.VillageGetPayload<{ select: T }>>;
  }

  async findFirst<T extends Prisma.VillageSelect>({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.VillageWhereInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.village.findFirst({
      where,
      select,
    }) as Promise<Prisma.VillageGetPayload<{ select: T }>>;
  }

  async findMany<T extends Prisma.VillageSelect>({
    tx,
    where,
    select,
    orderBy,
    take,
    skip,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.VillageWhereInput;
    select?: T;
    orderBy?: Prisma.VillageOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.village.findMany({
      where,
      select,
      orderBy,
      take,
      skip,
    }) as Promise<Prisma.VillageGetPayload<{ select: T }>[]>;
  }

  async findManyPaginate<T extends Prisma.VillageSelect>({
    tx,
    where,
    select,
    orderBy,
    page = 1,
    limit = 10,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.VillageWhereInput;
    select?: T;
    orderBy?: Prisma.VillageOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this.prisma;
    return paginate(
      prisma.village,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async updateById<T extends Prisma.VillageSelect>({
    tx,
    id,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.VillageUpdateInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.village.update({
      where: { id },
      data,
      select,
    }) as Promise<Prisma.VillageGetPayload<{ select: T }>>;
  }

  async deleteById<T extends Prisma.VillageSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.village.delete({
      where: { id },
      select,
    }) as Promise<Prisma.VillageGetPayload<{ select: T }>>;
  }
}
