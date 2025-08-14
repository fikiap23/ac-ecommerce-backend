import { Prisma } from '@prisma/client';

export const selectGeneralOrderPaymentMethod: Prisma.OrderPaymentMethodSelect =
  {
    uuid: true,
    name: true,
  };
