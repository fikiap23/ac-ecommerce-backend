import { Prisma } from '@prisma/client';

export type ICreateCategoryProduct = Prisma.CategoryProductCreateInput;
export type IUpdateCategoryProduct = Prisma.CategoryProductUpdateInput;

export type IFilterCategoryProduct = {
  sort: Prisma.SortOrder;
  page: number;
  limit: number;
  search?: string;
};
