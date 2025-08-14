import { Prisma } from '@prisma/client';
import { IFilterOrderPaymentMethod } from 'src/order/interfaces/order-payment-method.interface';

export const whereOrderPaymentMethodGetManyPaginate = (
  props: IFilterOrderPaymentMethod,
) => {
  const { search } = props;

  const where: Prisma.OrderPaymentMethodWhereInput = {};

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

  return { where };
};
