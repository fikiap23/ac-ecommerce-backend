import { Prisma } from '@prisma/client';
import { IFilterCustomer } from 'src/customer/interfaces/customer.interface';

export const whereCustomerGetManyPaginate = (props: IFilterCustomer) => {
  const { search, role } = props;

  const where: Prisma.CustomerWhereInput = {};

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

  if (role) {
    where.role = role;
  }

  return { where };
};
