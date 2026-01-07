import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class RegencyQuery {
  constructor(private readonly prisma: PrismaService) {}

  async create<T extends Prisma.RegencySelect>({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.RegencyCreateInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.regency.create({
      data,
      select,
    }) as Promise<Prisma.RegencyGetPayload<{ select: T }>>;
  }

  async findById<T extends Prisma.RegencySelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.regency.findUnique({
      where: { id },
      select,
    }) as Promise<Prisma.RegencyGetPayload<{ select: T }>>;
  }

  async findByUuid<T extends Prisma.RegencySelect>({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.regency.findUnique({
      where: { uuid },
      select,
    }) as Promise<Prisma.RegencyGetPayload<{ select: T }>>;
  }

  async findFirst<T extends Prisma.RegencySelect>({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.RegencyWhereInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.regency.findFirst({
      where,
      select,
    }) as Promise<Prisma.RegencyGetPayload<{ select: T }>>;
  }

  async findMany<T extends Prisma.RegencySelect>({
    tx,
    where,
    select,
    orderBy,
    take,
    skip,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.RegencyWhereInput;
    select?: T;
    orderBy?: Prisma.RegencyOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.regency.findMany({
      where,
      select,
      orderBy,
      take,
      skip,
    }) as Promise<Prisma.RegencyGetPayload<{ select: T }>[]>;
  }

  async findManyPaginate<T extends Prisma.RegencySelect>({
    tx,
    where,
    select,
    orderBy,
    page = 1,
    limit = 10,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.RegencyWhereInput;
    select?: T;
    orderBy?: Prisma.RegencyOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this.prisma;
    return paginate(
      prisma.regency,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async updateById<T extends Prisma.RegencySelect>({
    tx,
    id,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.RegencyUpdateInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.regency.update({
      where: { id },
      data,
      select,
    }) as Promise<Prisma.RegencyGetPayload<{ select: T }>>;
  }

  async deleteById<T extends Prisma.RegencySelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.regency.delete({
      where: { id },
      select,
    }) as Promise<Prisma.RegencyGetPayload<{ select: T }>>;
  }
}
