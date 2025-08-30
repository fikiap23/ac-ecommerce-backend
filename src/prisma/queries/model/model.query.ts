import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ModelQuery extends PrismaService {
  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.ModelSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.model.findUnique({
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
    select?: Prisma.ModelSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.model.findUnique({
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
    where?: Prisma.ModelWhereInput;
    select?: Prisma.ModelSelect;
    orderBy?: Prisma.ModelOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    const prisma = tx ?? this;
    return prisma.model.findMany({
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
    data: Prisma.ModelCreateInput;
    select?: Prisma.ModelSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.model.create({
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
    data: Prisma.ModelUpdateInput;
    select?: Prisma.ModelSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.model.update({
      where: { id },
      data,
      select,
    });
  }

  async delete({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    const prisma = tx ?? this;
    return prisma.model.delete({
      where: { id },
    });
  }
}
