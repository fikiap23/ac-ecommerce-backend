import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class ProvinceQuery {
  constructor(private readonly prisma: PrismaService) {}

  async create<T extends Prisma.ProvinceSelect>({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.ProvinceCreateInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.province.create({
      data,
      select,
    }) as Promise<Prisma.ProvinceGetPayload<{ select: T }>>;
  }

  async findById<T extends Prisma.ProvinceSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.province.findUnique({
      where: { id },
      select,
    }) as Promise<Prisma.ProvinceGetPayload<{ select: T }>>;
  }

  async findByUuid<T extends Prisma.ProvinceSelect>({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.province.findUnique({
      where: { uuid },
      select,
    }) as Promise<Prisma.ProvinceGetPayload<{ select: T }>>;
  }

  async findFirst<T extends Prisma.ProvinceSelect>({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ProvinceWhereInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.province.findFirst({
      where,
      select,
    }) as Promise<Prisma.ProvinceGetPayload<{ select: T }>>;
  }

  async findMany<T extends Prisma.ProvinceSelect>({
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
    const prisma = tx ?? this.prisma;
    return prisma.province.findMany({
      where,
      select,
      orderBy,
      take,
      skip,
    }) as Promise<Prisma.ProvinceGetPayload<{ select: T }>[]>;
  }

  async findManyPaginate<T extends Prisma.ProvinceSelect>({
    tx,
    where,
    select,
    orderBy,
    page = 1,
    limit = 10,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ProvinceWhereInput;
    select?: T;
    orderBy?: Prisma.ProvinceOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this.prisma;
    return paginate(
      prisma.province,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

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
    const prisma = tx ?? this.prisma;
    return prisma.province.update({
      where: { id },
      data,
      select,
    }) as Promise<Prisma.ProvinceGetPayload<{ select: T }>>;
  }

  async deleteById<T extends Prisma.ProvinceSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.province.delete({
      where: { id },
      select,
    }) as Promise<Prisma.ProvinceGetPayload<{ select: T }>>;
  }
}
