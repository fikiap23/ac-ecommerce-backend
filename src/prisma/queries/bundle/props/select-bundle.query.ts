import { Prisma } from '@prisma/client';

export const selectGeneralBundle: Prisma.BundleSelect = {
  id: true,
  uuid: true,
  name: true,
  description: true,
  isActive: true,
  price: true,
  salePrice: true,
  minusPrice: true,
  items: {
    select: {
      productId: true,
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
  bundleImage: { select: { url: true } },
};
