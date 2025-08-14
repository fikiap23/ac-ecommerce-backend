import { Prisma } from '@prisma/client';

export type IFilterOrderPaymentMethod = {
  sort: Prisma.SortOrder;
  page: number;
  limit: number;
  search?: string;
};
