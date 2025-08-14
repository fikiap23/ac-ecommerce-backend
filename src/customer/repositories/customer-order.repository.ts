import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrderQuery } from 'src/prisma/queries/order/order.query';
import { IFilterCustomerOrder } from '../interfaces/customer-order.interface';
import { whereCustomerOrderGetManyPaginate } from 'src/prisma/queries/customer/props/where-customer-order.prop';

@Injectable()
export class CustomerOrderRepository {
  constructor(private readonly orderQuery: OrderQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Customer Order Repository
    |--------------------------------------------------------------------------
    */

  async getManyPaginate({
    tx,
    filter,
    where: additionalWhere,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IFilterCustomerOrder;
    where?: Prisma.OrderWhereInput;
    select?: Prisma.OrderSelect;
  }) {
    const { sort, page, limit } = filter;

    const { where } = whereCustomerOrderGetManyPaginate(filter);

    const combinedWhere: Prisma.OrderWhereInput = {
      AND: [where, additionalWhere].filter(Boolean),
    };

    return await this.orderQuery.findManyPaginate({
      tx,
      where: combinedWhere,
      select,
      orderBy: { createdAt: sort },
      page,
      limit,
    });
  }
}
