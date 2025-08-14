import { Prisma } from '@prisma/client';
import { IFilterOrder } from 'src/order/interfaces/order.interface';

export const whereOrderGetManyPaginate = (props: IFilterOrder) => {
  const { search, status } = props;

  const where: Prisma.OrderWhereInput = {};

  if (search && search.trim() !== '') {
    where.OR = [
      {
        trackId: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        orderAddress: {
          address: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
    ];
  }

  if (status) {
    where.status = status;
  }

  return { where };
};
