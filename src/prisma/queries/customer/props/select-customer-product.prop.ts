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
  productId: true,
  productVariantId: true,
  product: {
    select: {
      id: true,
    },
  },
};
