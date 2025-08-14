import { Prisma } from '@prisma/client';

export const selectGeneralOrderDeliveryService: Prisma.OrderDeliveryServiceSelect =
  {
    uuid: true,
    courierId: true,
    courierName: true,
    deliveryType: true,
  };
