import { Prisma } from '@prisma/client';

export type ICreateMessage = Prisma.MessageCreateInput;
export type IUpdateMessage = Prisma.MessageUpdateInput;

export type IFilterMessage = {
  sort: Prisma.SortOrder;
  page: number;
  limit: number;
  search?: string;
};
