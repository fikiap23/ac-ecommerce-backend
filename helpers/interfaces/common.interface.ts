import { Prisma } from '@prisma/client';

export interface IFilterPaginate {
  startDate?: Date;
  endDate?: Date;
  sort?: Prisma.SortOrder;
  page?: number;
  limit?: number;
}
