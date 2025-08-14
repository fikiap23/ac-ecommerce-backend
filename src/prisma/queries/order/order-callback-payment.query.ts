import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderCallbackPaymentQuery extends PrismaService {
  async findByExternalId({
    tx,
    externalId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    externalId: string;
    select?: Prisma.OrderCallbackPaymentSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.orderCallbackPayment.findUnique({
      where: { externalId },
      select,
    });
  }

  async findByReferenceId({
    tx,
    referenceId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    referenceId: string;
    select?: Prisma.OrderCallbackPaymentSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.orderCallbackPayment.findUnique({
      where: { referenceId },
      select,
    });
  }

  async findByQrReferenceId({
    tx,
    qrReferenceId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    qrReferenceId: string;
    select?: Prisma.OrderCallbackPaymentSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.orderCallbackPayment.findUnique({
      where: { qrReferenceId },
      select,
    });
  }

  async findByPaylaterReferenceId({
    tx,
    paylaterReferenceId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    paylaterReferenceId: string;
    select?: Prisma.OrderCallbackPaymentSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.orderCallbackPayment.findUnique({
      where: { paylaterReferenceId },
      select,
    });
  }

  async findByRetailOutletReferenceId({
    tx,
    retailOutletReferenceId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    retailOutletReferenceId: string;
    select?: Prisma.OrderCallbackPaymentSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.orderCallbackPayment.findUnique({
      where: { retailOutletReferenceId },
      select,
    });
  }

  async findByOrderId({
    tx,
    orderId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    orderId: number;
    select?: Prisma.OrderCallbackPaymentSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.orderCallbackPayment.findUnique({
      where: { orderId },
      select,
    });
  }
}
