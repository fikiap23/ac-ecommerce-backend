import { Customer, Prisma, TypeRoleUser } from '@prisma/client';

export type ICreateCustomer = Prisma.CustomerCreateInput;
export type IUpdateCustomer = Prisma.CustomerUpdateInput;

export type ICustomerOrderBy = keyof Pick<Customer, 'createdAt' | 'name'>;

export type IFilterCustomer = {
  sort: Prisma.SortOrder;
  orderBy?: ICustomerOrderBy;
  page: number;
  limit: number;
  search?: string;
  role?: TypeRoleUser;
};
