import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomerVoucherQuery extends PrismaService {
  async upsert({
    tx,
    where,
    create,
    update,
  }: {
    tx?: Prisma.TransactionClient;
    where: Prisma.CustomerVoucherWhereUniqueInput;
    create: Prisma.CustomerVoucherCreateInput;
    update: Prisma.CustomerVoucherUpdateInput;
  }) {
    const prisma = tx ?? this;
    return await prisma.customerVoucher.upsert({
      where,
      create,
      update,
    });
  }
}
