import { Prisma, TypeProductService } from '@prisma/client';
import {
  selectGeneralProduct,
  selectProductForCreateOrder,
} from 'src/prisma/queries/product/props/select-product.prop';

export type ICreateProduct = Prisma.ProductCreateInput;
export type IUpdateProduct = Prisma.ProductUpdateInput;

export type ISelectProductForCreateOrder = Prisma.ProductGetPayload<{
  select: typeof selectProductForCreateOrder;
}>;
export type ISelectGeneralProduct = Prisma.ProductGetPayload<{
  select: typeof selectGeneralProduct;
}>;

export type IFilterProduct = {
  sort: Prisma.SortOrder;
  page: number;
  limit: number;
  search?: string;
  isActive?: string;
  isHide?: string;
  typeUuid?: string;
  modelUuid?: string;
  capacityUuid?: string;
  serviceType?: TypeProductService;
  categoryUuid?: string[];
};
