import { Prisma } from '@prisma/client';

export const SelectGeneralCustomerOrder: Prisma.OrderSelect = {
  id: true,
  voucherId: true,
  exchangePoint: true,
  customerId: true,
  paymentMethod: true,
  uuid: true,
  trackId: true,
  createdAt: true,
  status: true,
  orderAddress: {
    select: {
      address: true,
    },
  },
  orderProduct: {
    select: {
      quantity: true,
      name: true,
      price: true,
      orderProductImage: {
        select: {
          uuid: true,
          url: true,
        },
      },
    },
  },
  subTotalPay: true,
  voucherDiscount: true,
  deliveryFee: true,
  totalPayment: true,
  expiredAt: true,
};
