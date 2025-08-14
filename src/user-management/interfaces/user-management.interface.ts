import { Prisma } from '@prisma/client';

export type ICreateUserManagement = Prisma.UserAdminCreateInput;
export type IUpdateUserManagement = Prisma.UserAdminUpdateInput;

export type IFilterUserManagement = {
  sort: Prisma.SortOrder;
  page: number;
  limit: number;
  search?: string;
};
