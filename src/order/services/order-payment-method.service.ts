import { Injectable } from '@nestjs/common';
import { selectGeneralOrderPaymentMethod } from 'src/prisma/queries/order/props/select-order-payment-method.prop';
import { OrderPaymentMethodRepository } from '../repositories/order-payment-method.repository';

@Injectable()
export class OrderPaymentMethodService {
  constructor(
    private readonly orderPaymentMethodRepository: OrderPaymentMethodRepository,
  ) {}

  async getAll() {
    return await this.orderPaymentMethodRepository.getMany({
      select: selectGeneralOrderPaymentMethod,
    });
  }
}
