import { Prisma } from '@prisma/client';
import { IFilterOrder } from 'src/order/interfaces/order.interface';

export const whereOrderGetManyPaginate = (props: IFilterOrder) => {
  const { search, status, startDate, endDate } = props;

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
    ];
  }

  if (status) {
    where.status = status;
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  return { where };
};
