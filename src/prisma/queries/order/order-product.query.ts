import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderProductQuery extends PrismaService {
  async findMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderProductWhereInput;
    select?: Prisma.OrderProductSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.orderProduct.findMany({ where, select });
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: Prisma.OrderProductUpdateInput;
  }) {
    const prisma = tx ?? this;
    return await prisma.orderProduct.update({ where: { uuid }, data });
  }
}
