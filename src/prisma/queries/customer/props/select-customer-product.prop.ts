import { Prisma } from '@prisma/client';

export const selectCustomerProduct: Prisma.CustomerProductSelect = {
  uuid: true,
  quantity: true,
  productVariant: true,
  deviceId: true,
  customerProductBundle: {
    include: {
      product: {
        select: {
          id: true,
          uuid: true,
          name: true,
        },
      },
      productVariant: {
        select: {
          id: true,
          uuid: true,
          name: true,
          capacity: true,
        },
      },
    },
  },
  bundle: {
    include: {
      items: {
        include: {
          product: {
            include: {
              productVariant: true,
            },
          },
        },
      },
      bundleImage: true,
    },
  },
  product: {
    select: {
      uuid: true,
      name: true,
      brand: true,
      packageType: true,
      serviceType: true,
      description: true,
      price: true,
      salePrice: true,
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
    },
  },
};

export const selectCustomerProductForUpdate: Prisma.CustomerProductSelect = {
  id: true,
  uuid: true,
  quantity: true,
  deviceId: true,
  productId: true,
  productVariantId: true,
  bundleId: true,
  product: {
    select: {
      id: true,
      uuid: true,
      name: true,
      productVariant: {
        select: { id: true, uuid: true, name: true, stock: true },
      },
    },
  },
  bundle: {
    select: {
      id: true,
      uuid: true,
      name: true,
      items: {
        select: {
          product: {
            select: {
              id: true,
              uuid: true,
              name: true,
              productVariant: {
                select: { id: true, uuid: true, name: true, stock: true },
              },
            },
          },
        },
      },
    },
  },
  customerProductBundle: {
    select: {
      id: true,
      productId: true,
      productVariantId: true,
      product: { select: { uuid: true } },
    },
  },
  customer: { select: { id: true } },
};
