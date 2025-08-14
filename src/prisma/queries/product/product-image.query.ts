import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductImageQuery extends PrismaService {
  async deleteMany({
    tx,
    productId,
  }: {
    tx?: Prisma.TransactionClient;
    productId: number;
  }) {
    const prisma = tx ?? this;
    return await prisma.productImage.deleteMany({ where: { productId } });
  }

  async count({
    tx,
    where,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ProductImageWhereInput;
  }) {
    const prisma = tx ?? this;
    return await prisma.productImage.count({ where });
  }
}
