import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TypeQuery extends PrismaService {
  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.TypeSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.type.findUnique({
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
    select?: Prisma.TypeSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.type.findUnique({
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
    where?: Prisma.TypeWhereInput;
    select?: Prisma.TypeSelect;
    orderBy?: Prisma.TypeOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    const prisma = tx ?? this;
    return prisma.type.findMany({
      where,
      select,
      orderBy,
      skip,
      take,
    });
  }

  async create({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.TypeCreateInput;
    select?: Prisma.TypeSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.type.create({
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
    data: Prisma.TypeUpdateInput;
    select?: Prisma.TypeSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.type.update({
      where: { id },
      data,
      select,
    });
  }

  async delete({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    const prisma = tx ?? this;
    return prisma.type.delete({
      where: { id },
    });
  }
}
