import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TechnicianQuery extends PrismaService {
  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.TechnicianSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.technician.findUnique({
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
    select?: Prisma.TechnicianSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.technician.findUnique({
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
    where?: Prisma.TechnicianWhereInput;
    select?: Prisma.TechnicianSelect;
    orderBy?: Prisma.TechnicianOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    const prisma = tx ?? this;
    return prisma.technician.findMany({
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
    data: Prisma.TechnicianCreateInput;
    select?: Prisma.TechnicianSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.technician.create({
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
    data: Prisma.TechnicianUpdateInput;
    select?: Prisma.TechnicianSelect;
  }) {
    const prisma = tx ?? this;
    return prisma.technician.update({
      where: { id },
      data,
      select,
    });
  }

  async delete({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    const prisma = tx ?? this;
    return prisma.technician.delete({
      where: { id },
    });
  }
}
