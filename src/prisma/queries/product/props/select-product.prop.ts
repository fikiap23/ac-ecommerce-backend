import { Prisma } from '@prisma/client';

export const selectGeneralProduct: Prisma.ProductSelect = {
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

  productVariant: true,
};

export const selectProductForCreateOrder: Prisma.ProductSelect = {
  id: true,
  uuid: true,
  name: true,
  description: true,
  price: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  categoryProduct: true,
  productImage: true,
  productVoucer: true,
};

export const selectProductForCreateCustomerProduct: Prisma.ProductSelect = {
  id: true,
};
