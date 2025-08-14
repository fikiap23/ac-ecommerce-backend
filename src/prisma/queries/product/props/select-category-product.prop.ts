import { Prisma } from '@prisma/client';

export const selectGeneralCategoryProduct: Prisma.CategoryProductSelect = {
  uuid: true,
  name: true,
};
