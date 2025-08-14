import { Prisma } from '@prisma/client';
import { IFilterCustomerOrder } from 'src/customer/interfaces/customer-order.interface';

export const whereCustomerOrderGetManyPaginate = (
  props: IFilterCustomerOrder,
) => {
  const { search, status, startDate, endDate } = props;

  const where: Prisma.OrderWhereInput = {};

  if (search && search.trim() !== '') {
    where.OR = [
      {
        orderProduct: {
          some: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
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
