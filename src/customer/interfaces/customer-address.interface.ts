import { Prisma } from '@prisma/client';

export type ICreateCustomerAddress = Prisma.CustomerAddressCreateInput;
export type IUpdateCustomerAddress = Prisma.CustomerAddressUpdateInput;

export type IFilterCustomerAddress = {
  sort: Prisma.SortOrder;
  page: number;
  limit: number;
  search?: string;
};
