import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomerVoucherQuery } from 'src/prisma/queries/customer/customer-voucher.query';

@Injectable()
export class CustomerVoucherRepository {
  constructor(private readonly customerVoucherQuery: CustomerVoucherQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Customer Voucher Repository
    |--------------------------------------------------------------------------
    */

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
    return await this.customerVoucherQuery.upsert({
      tx,
      where,
      create,
      update,
    });
  }
}
