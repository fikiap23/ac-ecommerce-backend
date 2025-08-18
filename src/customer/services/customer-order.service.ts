import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { SelectGeneralCustomerOrder } from 'src/prisma/queries/customer/props/select-customer-order.prop';
import { CustomerOrderRepository } from '../repositories/customer-order.repository';
import {
  IFilterCustomerOrder,
  ISelectGeneralCustomerOrder,
} from '../interfaces/customer-order.interface';
import { GatewayService } from 'src/gateway/services/gateway.service';
import { OrderRepository } from 'src/order/repositories/order.repository';
import { VoucherRepository } from 'src/voucher/repositories/voucher.repository';
import { GatewayXenditRepository } from 'src/gateway/repositories/gateway-xendit.repository';
import { OrderCallbackPaymentRepository } from 'src/order/repositories/order-callback-payment.repository';
import { TypeStatusOrder } from '@prisma/client';

@Injectable()
export class CustomerOrderService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerOrderRepository: CustomerOrderRepository,
    private readonly gatewayService: GatewayService,
    private readonly orderRepository: OrderRepository,
    private readonly voucherRepository: VoucherRepository,
    private readonly gatewayXenditRepository: GatewayXenditRepository,
    private readonly orderCallbackPaymentRepository: OrderCallbackPaymentRepository,
  ) {}

  async getAll(uuid: string, filter: IFilterCustomerOrder) {
    const customer = await this.customerRepository.getThrowByUuid({ uuid });

    const orders = await this.customerOrderRepository.getManyPaginate({
      where: { customerId: customer.id },
      filter,
      select: SelectGeneralCustomerOrder,
    });

    await Promise.all(
      orders.data.map(async (order: ISelectGeneralCustomerOrder) => {
        if (order.expiredAt && order.expiredAt < new Date()) {
          await this.orderRepository.update({
            where: { id: order.id },
            data: {
              status: TypeStatusOrder.CANCELLED,
              expiredAt: null,
            },
          });

          if (order.voucherId) {
            await this.voucherRepository.updateById({
              id: order.voucherId,
              data: {
                quota: {
                  increment: 1,
                },
              },
            });
          }

          const isVa = this.gatewayXenditRepository.isVa(order.paymentMethod);
          const orderCallbackPayment =
            await this.orderCallbackPaymentRepository.getThrowByOrderId({
              orderId: order.id,
            });
          if (isVa) {
            await this.gatewayService.httpPatchVa(
              orderCallbackPayment.xenditId,
              {
                expiration_date: new Date(),
              },
            );
          }

          order.status = TypeStatusOrder.CANCELLED;
          order.expiredAt = null;
        }
      }),
    );

    return {
      data: orders.data.map((order: ISelectGeneralCustomerOrder) => {
        return {
          uuid: order.uuid,
          trackId: order.trackId,
          createdAt: order.createdAt,
          exchangePoint: order.exchangePoint,
          status: order.status,
          orderProduct: order.orderProduct,
          totalPayment: order.totalPayment,
          expiredAt: order.expiredAt,
          orderAddress: order.orderAddress,
          subTotalPay: order.subTotalPay,
          voucherDiscount: order.voucherDiscount,
          deliveryFee: order.deliveryFee,
        };
      }),
      meta: orders.meta,
    };
  }
}
