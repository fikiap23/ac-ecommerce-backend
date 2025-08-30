import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CapacityQuery extends PrismaService {
  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.CapacitySelect;
  }) {
    const prisma = tx ?? this;
    return prisma.capacity.findUnique({
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
    select?: Prisma.CapacitySelect;
  }) {
    const prisma = tx ?? this;
    return prisma.capacity.findUnique({
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
    where?: Prisma.CapacityWhereInput;
    select?: Prisma.CapacitySelect;
    orderBy?: Prisma.CapacityOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    const prisma = tx ?? this;
    return prisma.capacity.findMany({
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
    data: Prisma.CapacityCreateInput;
    select?: Prisma.CapacitySelect;
  }) {
    const prisma = tx ?? this;
    return prisma.capacity.create({
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
    data: Prisma.CapacityUpdateInput;
    select?: Prisma.CapacitySelect;
  }) {
    const prisma = tx ?? this;
    return prisma.capacity.update({
      where: { id },
      data,
      select,
    });
  }

  async delete({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    const prisma = tx ?? this;
    return prisma.capacity.delete({
      where: { id },
    });
  }
}
