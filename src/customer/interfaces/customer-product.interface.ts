import { Prisma } from '@prisma/client';
import { selectCustomerProduct } from 'src/prisma/queries/customer/props/select-customer-product.prop';
import { selectGenerealBundle } from 'src/prisma/queries/product/props/select-product.prop';

export type ICreateCustomerProduct = Prisma.CustomerProductCreateInput;
export type IUpdateCustomerProduct = Prisma.CustomerProductUpdateInput;

export type ISelectGeneralBundle = Prisma.BundleGetPayload<{
  select: typeof selectGenerealBundle;
}>;

export type ISelectCustomerProduct = Prisma.CustomerProductGetPayload<{
  select: typeof selectCustomerProduct;
}>;
