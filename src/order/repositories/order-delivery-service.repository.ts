import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DeliveryServiceQuery } from 'src/prisma/queries/order/order-delivery-service.query';
import { IFilterOrderDeliveryService } from '../interfaces/order-delivery-service.interface';
import { whereOrderDeliveryServiceGetManyPaginate } from 'src/prisma/queries/order/props/where-order-delivery-service.prop';

@Injectable()
export class OrderDeliveryServiceRepository {
  constructor(private readonly deliveryServiceQuery: DeliveryServiceQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Delivery Service Repository
    |--------------------------------------------------------------------------
    */

  async getManyPaginate({
    tx,
    filter,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IFilterOrderDeliveryService;
    select?: Prisma.OrderDeliveryServiceSelect;
  }) {
    const { sort, page, limit } = filter;

    const { where } = whereOrderDeliveryServiceGetManyPaginate(filter);

    return await this.deliveryServiceQuery.findManyPaginate({
      tx,
      where,
      select,
      orderBy: { createdAt: sort },
      page,
      limit,
    });
  }

  allowedDeliveryService() {
    return [
      { courier: 'JNE', service_type: 'Reguler' },
      { courier: 'JNT', service_type: 'Reguler' },
      { courier: 'NINJA EXPRESS', service_type: 'Reguler' },
      { courier: 'SAP', service_type: 'REGULER' },
      { courier: 'SICEPAT', service_type: 'Reguler' },
    ];
  }
}
