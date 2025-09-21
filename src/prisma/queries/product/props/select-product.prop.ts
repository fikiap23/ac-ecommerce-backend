import { Prisma } from '@prisma/client';

export const selectGeneralProduct: Prisma.ProductSelect = {
  uuid: true,
  name: true,
  brand: true,
  capacity: true,
  model: true,
  type: true,
  serviceType: true,
  packageType: true,
  salePrice: true,
  description: true,
  price: true,
  isActive: true,
  isHide: true,
  rating: true,
  createdAt: true,

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

export const selectGenerealBundle: Prisma.BundleSelect = {
  id: true,
  uuid: true,
  name: true,
  description: true,
  price: true,
  isActive: true,
  isHide: true,
  minusPrice: true,
  salePrice: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,

  bundleImage: {
    select: {
      uuid: true,
      url: true,
    },
  },

  items: {
    include: {
      product: {
        select: selectGeneralProduct,
      },
    },
  },
};

export const selectProductForCreateOrder: Prisma.ProductSelect = {
  id: true,
  uuid: true,
  name: true,
  description: true,
  serviceType: true,
  packageType: true,
  price: true,
  salePrice: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  categoryProduct: true,
  productImage: true,
  productVoucer: true,
  productVariant: true,
  model: true,
  capacity: true,
  type: true,
};

export const selectProductForCreateCustomerProduct: Prisma.ProductSelect = {
  id: true,
  serviceType: true,
};
