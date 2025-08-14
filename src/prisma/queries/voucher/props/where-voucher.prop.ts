import { Prisma } from '@prisma/client';
import { IFilterVoucher } from 'src/voucher/interfaces/voucher.interface';

export const whereVoucherGetManyPaginate = (props: IFilterVoucher) => {
  const { search, type, status } = props;

  const where: Prisma.VoucherWhereInput = {};

  if (search && search.trim() !== '') {
    where.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  return { where };
};
