import { Prisma } from '@prisma/client';

export const selectCustomerProduct: Prisma.CustomerProductSelect = {
  uuid: true,
  quantity: true,
  product: {
    select: {
      uuid: true,
      name: true,
      description: true,
      price: true,
      isActive: true,
      categoryProduct: {
        select: {
          uuid: true,
          name: true,
        },
      },
      productImage: {
        select: {
          uuid: true,
          url: true,
        },
      },
    },
  },
};

export const selectCustomerProductForUpdate: Prisma.CustomerProductSelect = {
  productId: true,
  product: {
    select: {
      id: true,
    },
  },
};
