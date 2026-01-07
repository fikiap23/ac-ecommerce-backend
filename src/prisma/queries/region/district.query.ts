import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class DistrictQuery {
  constructor(private readonly prisma: PrismaService) {}

  async create<T extends Prisma.DistrictSelect>({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.DistrictCreateInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.district.create({
      data,
      select,
    }) as Promise<Prisma.DistrictGetPayload<{ select: T }>>;
  }

  async findById<T extends Prisma.DistrictSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.district.findUnique({
      where: { id },
      select,
    }) as Promise<Prisma.DistrictGetPayload<{ select: T }>>;
  }

  async findByUuid<T extends Prisma.DistrictSelect>({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.district.findUnique({
      where: { uuid },
      select,
    }) as Promise<Prisma.DistrictGetPayload<{ select: T }>>;
  }

  async findFirst<T extends Prisma.DistrictSelect>({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.DistrictWhereInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.district.findFirst({
      where,
      select,
    }) as Promise<Prisma.DistrictGetPayload<{ select: T }>>;
  }

  async findMany<T extends Prisma.DistrictSelect>({
    tx,
    where,
    select,
    orderBy,
    take,
    skip,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.DistrictWhereInput;
    select?: T;
    orderBy?: Prisma.DistrictOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.district.findMany({
      where,
      select,
      orderBy,
      take,
      skip,
    }) as Promise<Prisma.DistrictGetPayload<{ select: T }>[]>;
  }

  async findManyPaginate<T extends Prisma.DistrictSelect>({
    tx,
    where,
    select,
    orderBy,
    page = 1,
    limit = 10,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.DistrictWhereInput;
    select?: T;
    orderBy?: Prisma.DistrictOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this.prisma;
    return paginate(
      prisma.district,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async updateById<T extends Prisma.DistrictSelect>({
    tx,
    id,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.DistrictUpdateInput;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.district.update({
      where: { id },
      data,
      select,
    }) as Promise<Prisma.DistrictGetPayload<{ select: T }>>;
  }

  async deleteById<T extends Prisma.DistrictSelect>({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: T;
  }) {
    const prisma = tx ?? this.prisma;
    return prisma.district.delete({
      where: { id },
      select,
    }) as Promise<Prisma.DistrictGetPayload<{ select: T }>>;
  }
}
