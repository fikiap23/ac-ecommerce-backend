import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductVariantQuery extends PrismaService {
  async findByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.ProductVariantSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.productVariant.findUnique({
      where: { uuid },
      select,
    });
  }

  async findByUuidAndProductId({
    tx,
    uuid,
    productId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    productId: number;
    select?: Prisma.ProductVariantSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.productVariant.findUnique({
      where: { uuid, productId },
      select,
    });
  }

  async deleteMany({
    tx,
    productId,
  }: {
    tx?: Prisma.TransactionClient;
    productId: number;
  }) {
    const prisma = tx ?? this;
    return await prisma.productVariant.deleteMany({ where: { productId } });
  }

  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.ProductVariantSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.productVariant.findUnique({ where: { id }, select });
  }
}
