import { Prisma } from '@prisma/client';

export const selectGeneralCategoryProduct: Prisma.CategoryProductSelect = {
  id: true,
  uuid: true,
  name: true,
  type: true,
  createdAt: true,
  updatedAt: true,
};
