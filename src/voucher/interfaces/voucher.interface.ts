import {
  Prisma,
  TypeStatusVoucher,
  TypeVoucher,
  Voucher,
} from '@prisma/client';
import { selectVoucherForCalculate } from 'src/prisma/queries/voucher/props/select-voucher.prop';

export type ICreateVoucher = Prisma.VoucherCreateInput;
export type IUpdateVoucher = Prisma.VoucherUpdateInput;

export type ISelectVoucherForCalculate = Prisma.VoucherGetPayload<{
  select: typeof selectVoucherForCalculate;
}>;

export type IVoucherOrderBy = keyof Pick<
  Voucher,
  'name' | 'type' | 'quota' | 'startDate' | 'status'
>;

export type IFilterVoucher = {
  sort: Prisma.SortOrder;
  orderBy?: IVoucherOrderBy;
  page: number;
  limit: number;
  search?: string;
  type?: TypeVoucher;
  status?: TypeStatusVoucher;
};
