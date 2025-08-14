import { Prisma } from '@prisma/client';
import { IFilterProduct } from 'src/product/interfaces/product.interface';

export const whereProductGetManyPaginate = (props: IFilterProduct) => {
  const { search, isActive, categoryUuid } = props;

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
  };

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

  if (isActive === 'true') {
    where.isActive = true;
  } else if (isActive === 'false') {
    where.isActive = false;
  }

  if (categoryUuid) {
    where.categoryProduct = {
      uuid: { in: categoryUuid },
    };
  }

  return { where };
};
