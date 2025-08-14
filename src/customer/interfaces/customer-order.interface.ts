import { Prisma, TypeStatusOrder } from '@prisma/client';
import { SelectGeneralCustomerOrder } from 'src/prisma/queries/customer/props/select-customer-order.prop';

export type ISelectGeneralCustomerOrder = Prisma.OrderGetPayload<{
  select: typeof SelectGeneralCustomerOrder;
}>;

export type IFilterCustomerOrder = {
  sort: Prisma.SortOrder;
  page: number;
  limit: number;
  search?: string;
  status?: TypeStatusOrder;
  startDate?: string;
  endDate?: string;
};
