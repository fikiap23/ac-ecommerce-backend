import { Prisma } from '@prisma/client';

export type IFilterOrderDeliveryService = {
  sort: Prisma.SortOrder;
  page: number;
  limit: number;
  search?: string;
};

export type IOrderDeliveryService = {
  province: string;
  city: string;
  subDistrict: string;
  suburbOrVillage: string;
  postalCode: string;
  weight: string;
  goodsValue: string;
};
