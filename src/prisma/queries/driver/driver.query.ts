import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DriverQuery extends PrismaService {
  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.DriverSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.driver.findUnique({
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
    select?: Prisma.DriverSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.driver.findUnique({
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
    where?: Prisma.DriverWhereInput;
    select?: Prisma.DriverSelect;
    orderBy?: Prisma.DriverOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    const prisma = tx ?? this;
    return prisma.driver.findMany({
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
    data: Prisma.DriverCreateInput;
    select?: Prisma.DriverSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.driver.create({
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
    data: Prisma.DriverUpdateInput;
    select?: Prisma.DriverSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.driver.update({
      where: { id },
      data,
      select,
    });
  }

  async delete({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    const prisma = tx ?? this;
    return prisma.driver.delete({
      where: { id },
    });
  }
}
