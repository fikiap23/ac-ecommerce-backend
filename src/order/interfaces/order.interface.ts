import { Prisma, TypeStatusOrder } from '@prisma/client';
import {
  IEWalletWebhookResponse,
  IPaylaterWebhookResponse,
  IQrCodeWebhookResponse,
  IRetailOutletWebhookResponse,
  IVaWebhookResponse,
} from 'src/gateway/interfaces/gateway-xendit.interface';
import {
  selectGeneralListOrders,
  selectGeneralOrder,
  selectOrderProductWithRelations,
} from 'src/prisma/queries/order/props/select-order.prop';
import { selectProductForCreateOrder } from 'src/prisma/queries/product/props/select-product.prop';

export type ICreateOrder = Prisma.OrderCreateInput;

export type ISelectProductForCreateOrder = Prisma.ProductGetPayload<{
  select: typeof selectProductForCreateOrder;
}>;

export type IselectOrderProductWithRelations = Prisma.OrderProductGetPayload<{
  select: typeof selectOrderProductWithRelations;
}>;
export type ISelectGeneralOrder = Prisma.OrderGetPayload<{
  select: typeof selectGeneralOrder;
}>;
export type ISelectGeneralListOrder = Prisma.OrderGetPayload<{
  select: typeof selectGeneralListOrders;
}>;

export type IFilterOrder = {
  sort: Prisma.SortOrder;
  page: number;
  limit: number;
  search?: string;
  status?: TypeStatusOrder;
  startDate?: string;
  endDate?: string;
};

export type IOrderPayment = IVaWebhookResponse &
  IEWalletWebhookResponse &
  IQrCodeWebhookResponse &
  IPaylaterWebhookResponse &
  IRetailOutletWebhookResponse;

export type IDeviceListFilter = {
  page?: number;
  limit?: number;
  search?: string;
  orderUuid?: string;
  orderId?: number;
  customerId: number;
  sort?: Prisma.SortOrder;
};

export type IFilterReportSummary = {
  startDate?: string;
  endDate?: string;
};

export type IFilterReportTransactionStats = {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  by?: 'revenue' | 'qty';

  startDate?: string;
  endDate?: string;
};

export type IFilterReportRecentTransaction = {
  startDate?: String;
  endDate?: String;
} & IFilterOrder;
