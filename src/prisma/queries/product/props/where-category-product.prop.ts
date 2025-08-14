import { Prisma } from '@prisma/client';
import { IFilterCategoryProduct } from 'src/product/interfaces/category-product.interface';

export const whereCategoryProductGetManyPaginate = (
  props: IFilterCategoryProduct,
) => {
  const { search } = props;

  const where: Prisma.CategoryProductWhereInput = {};

  if (search && search.trim() !== '') {
    where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
  }

  return { where };
};
