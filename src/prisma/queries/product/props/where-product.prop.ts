import { Prisma } from '@prisma/client';
import { IFilterProduct } from 'src/product/interfaces/product.interface';

export const whereProductGetManyPaginate = (props: IFilterProduct) => {
  const {
    search,
    isActive,
    isHide,
    typeUuid,
    modelUuid,
    capacityUuid,
    serviceType,
    categoryUuid,
  } = props;

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

  if (isHide === 'true') {
    where.isHide = true;
  } else if (isHide === 'false') {
    where.isHide = false;
  }

  if (typeUuid) {
    where.type = {
      uuid: typeUuid,
    };
  }

  if (modelUuid) {
    where.model = {
      uuid: modelUuid,
    };
  }

  if (capacityUuid) {
    where.capacity = {
      uuid: capacityUuid,
    };
  }

  if (serviceType) {
    where.serviceType = serviceType;
  }

  if (categoryUuid && categoryUuid.length > 0) {
    where.categoryProduct = {
      uuid: { in: categoryUuid },
    };
  }

  return { where };
};
