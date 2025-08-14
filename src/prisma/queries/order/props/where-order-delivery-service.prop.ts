import { Prisma } from '@prisma/client';
import { IFilterOrderDeliveryService } from 'src/order/interfaces/order-delivery-service.interface';

export const whereOrderDeliveryServiceGetManyPaginate = (
  props: IFilterOrderDeliveryService,
) => {
  const { search } = props;

  const where: Prisma.OrderDeliveryServiceWhereInput = {};

  if (search && search.trim() !== '') {
    where.OR = [
      {
        courierId: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  return { where };
};
