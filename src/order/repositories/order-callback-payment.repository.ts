import { Injectable } from '@nestjs/common';
import { CustomError } from 'helpers/http.helper';
import { Prisma } from '@prisma/client';
import { OrderCallbackPaymentQuery } from 'src/prisma/queries/order/order-callback-payment.query';

@Injectable()
export class OrderCallbackPaymentRepository {
  constructor(
    private readonly orderCallbackPaymentQuery: OrderCallbackPaymentQuery,
  ) {}

  /*
    |--------------------------------------------------------------------------
    | Order Callback Payment Repository
    |--------------------------------------------------------------------------
    */

  async getThrowByExternalId({
    tx,
    externalId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    externalId: string;
    select?: Prisma.OrderCallbackPaymentSelect;
  }) {
    const result = await this.orderCallbackPaymentQuery.findByExternalId({
      tx,
      externalId,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Order callback payment tidak ditemukan',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByReferenceId({
    tx,
    referenceId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    referenceId: string;
    select?: Prisma.OrderCallbackPaymentSelect;
  }) {
    const result = await this.orderCallbackPaymentQuery.findByReferenceId({
      tx,
      referenceId,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Order callback payment tidak ditemukan',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByQrReferenceId({
    tx,
    qrReferenceId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    qrReferenceId: string;
    select?: Prisma.OrderCallbackPaymentSelect;
  }) {
    const result = await this.orderCallbackPaymentQuery.findByQrReferenceId({
      tx,
      qrReferenceId,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Order callback payment tidak ditemukan',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByPaylaterReferenceId({
    tx,
    paylaterReferenceId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    paylaterReferenceId: string;
    select?: Prisma.OrderCallbackPaymentSelect;
  }) {
    const result =
      await this.orderCallbackPaymentQuery.findByPaylaterReferenceId({
        tx,
        paylaterReferenceId,
        select,
      });

    if (!result) {
      throw new CustomError({
        message: 'Order callback payment tidak ditemukan',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByRetailOutletReferenceId({
    tx,
    retailOutletReferenceId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    retailOutletReferenceId: string;
    select?: Prisma.OrderCallbackPaymentSelect;
  }) {
    const result =
      await this.orderCallbackPaymentQuery.findByRetailOutletReferenceId({
        tx,
        retailOutletReferenceId,
        select,
      });

    if (!result) {
      throw new CustomError({
        message: 'Order callback payment tidak ditemukan',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByOrderId({
    tx,
    orderId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    orderId: number;
    select?: Prisma.OrderCallbackPaymentSelect;
  }) {
    const result = await this.orderCallbackPaymentQuery.findByOrderId({
      tx,
      orderId,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Order callback payment tidak ditemukan',
        statusCode: 404,
      });
    }

    return result;
  }
}
