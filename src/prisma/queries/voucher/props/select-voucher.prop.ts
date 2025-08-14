import { Prisma } from '@prisma/client';

export const selectGeneralVoucher = (sub: string): Prisma.VoucherSelect => {
  return {
    uuid: true,
    name: true,
    description: true,
    startDate: true,
    endDate: true,
    status: true,
    type: true,
    discountAmount: true,
    minimumAmount: true,
    quota: true,
    claimLimitPerUser: true,
    maxDiscount: true,
    productVoucher: {
      select: {
        product: {
          select: {
            uuid: true,
            name: true,
          },
        },
      },
    },
    customerVoucher: {
      where: {
        customer: {
          uuid: sub,
        },
      },
      select: {
        usageCount: true,
      },
    },
  };
};

export const selectVoucherForCalculate: Prisma.VoucherSelect = {
  id: true,
  uuid: true,
  name: true,
  description: true,
  startDate: true,
  endDate: true,
  status: true,
  type: true,
  discountAmount: true,
  minimumAmount: true,
  quota: true,
  claimLimitPerUser: true,
  maxDiscount: true,
  productVoucher: {
    select: {
      product: {
        select: {
          uuid: true,
          name: true,
        },
      },
    },
  },
};
