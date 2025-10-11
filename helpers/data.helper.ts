import {
  OrderProduct,
  TypeProductPackage,
  TypeStatusOrder,
} from '@prisma/client';
import { groupBy } from 'lodash';
import * as moment from 'moment';

export const genIdPrefixTimestamp = (prefix: string) => {
  const ts = moment().format('YYYYMMDDHHmmssSSS');

  return prefix + '-' + ts;
};

export const genSlug = (input: string) => {
  // remove symbols using regular expression
  const cleanedInput = input.replace(/[^\w\s-]/g, '');

  // replace spaces with dashes, excluding the last space
  const slug = cleanedInput.replace(/\s+(?=\S)(?!$)/g, '-').toLowerCase();

  return slug;
};

export const genRandomNumber = (length: number): string => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};

export const genRandomString = (length: number): string => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export function splitName(fullName: string) {
  if (!fullName || typeof fullName !== 'string') {
    return { givenNames: 'Guest', surname: '-' };
  }

  const parts = fullName.trim().split(/\s+/);
  const given_names = parts.slice(0, -1).join(' ') || parts[0];
  const surname = parts.length > 1 ? parts.slice(-1).join(' ') : '-';

  return { givenNames: given_names, surname };
}

export function formatToISOE164(phone: string) {
  if (!phone || typeof phone !== 'string') return null;

  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }

  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }

  return '+' + cleaned;
}

export function parseFormBoolean(value?: any): boolean {
  return value === 'true' || value === '1';
}

export function statusOrderToText(status: string) {
  switch (status) {
    case TypeStatusOrder.CANCELLED:
      return 'Dibatalkan';
    case TypeStatusOrder.DELIVERED:
      return 'Selesai';
    case TypeStatusOrder.ON_PROGRESS:
      return 'Dalam Proses';
    case TypeStatusOrder.PACKED:
      return 'Dikemas';
    case TypeStatusOrder.SHIPPED:
      return 'Dikirim';
    case TypeStatusOrder.WAITING_PAYMENT:
      return 'Menunggu Pembayaran';
    default:
      return '-';
  }
}

export type GroupedBundleProduct = {
  bundleGroupId: string;
  bundleName: string;
  minusPrice: number;
  totalPrice: number;
  quantity: number;
  bundleImage: string | null;
  orderProduct: OrderProduct[];
};

type FilteredOrderProductResult = (GroupedBundleProduct | OrderProduct)[];

export const filterOrderProduct = (
  orderProduct: OrderProduct[],
): FilteredOrderProductResult => {
  const result: FilteredOrderProductResult = [];

  // Separate bundle products and single products
  const bundleProducts = orderProduct.filter(
    (item) =>
      item.sourcePackageType === TypeProductPackage.BUNDLE &&
      item.bundleGroupId,
  );

  const singleProducts = orderProduct.filter(
    (item) =>
      item.sourcePackageType === TypeProductPackage.SINGLE ||
      !item.bundleGroupId,
  );

  // Group bundle products by bundleGroupId
  const groupedByBundle = groupBy(bundleProducts, 'bundleGroupId');

  // Process grouped bundles
  Object.entries(groupedByBundle).forEach(([bundleGroupId, products]) => {
    if (bundleGroupId !== 'null' && products.length > 0) {
      const firstProduct = products[0];
      const groupedBundle: GroupedBundleProduct = {
        bundleGroupId,
        bundleName: firstProduct.bundleName || '',
        minusPrice: firstProduct.minusPrice || 0,
        bundleImage: firstProduct.bundleImage || null,
        quantity: firstProduct.quantity,
        totalPrice: products.reduce(
          (acc, product) => Number(acc) + Number(product.price),
          0,
        ),
        orderProduct: products,
      };
      result.push(groupedBundle);
    }
  });

  // Add single products directly to result
  singleProducts.forEach((product) => {
    result.push(product);
  });

  return result;
};
