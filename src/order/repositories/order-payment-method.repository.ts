import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaymentMethodQuery } from 'src/prisma/queries/order/order-payment-method.query';
import { IFilterOrderPaymentMethod } from '../interfaces/order-payment-method.interface';
import { whereOrderPaymentMethodGetManyPaginate } from 'src/prisma/queries/order/props/where-order-payment-method.prop';

@Injectable()
export class OrderPaymentMethodRepository {
  constructor(private readonly paymentMethodQuery: PaymentMethodQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Payment Method Repository
    |--------------------------------------------------------------------------
    */

  async getManyPaginate({
    tx,
    filter,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IFilterOrderPaymentMethod;
    select?: Prisma.OrderPaymentMethodSelect;
  }) {
    const { sort, page, limit } = filter;

    const { where } = whereOrderPaymentMethodGetManyPaginate(filter);

    return await this.paymentMethodQuery.findManyPaginate({
      tx,
      where,
      select,
      orderBy: { createdAt: sort },
      page,
      limit,
    });
  }

  async getMany({
    tx,
    where,
    select,
    orderBy,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderPaymentMethodWhereInput;
    select?: Prisma.OrderPaymentMethodSelect;
    orderBy?: Prisma.OrderPaymentMethodOrderByWithRelationInput;
  }) {
    return await this.paymentMethodQuery.findMany({
      tx,
      where,
      select,
      orderBy,
    });
  }
}
