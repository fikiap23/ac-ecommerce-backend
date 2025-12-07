import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { parseFormBoolean } from 'helpers/data.helper';
import { IPaginatedResult } from 'src/prisma/interfaces/paginated-result.interface';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ICreateProduct,
  IFilterProduct,
  IUpdateProduct,
} from 'src/product/interfaces/product.interface';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class ProductQuery extends PrismaService {
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateProduct;
  }) {
    const prisma = tx ?? this;
    return await prisma.product.create({ data });
  }

  async findMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ProductWhereInput;
    select?: Prisma.ProductSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.product.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      select,
    });
  }

  async findManyPaginateAll({
    tx,
    where,
    filter,
    select,
    orderBy,
    page = 1,
    limit = 10,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ProductWhereInput;
    select?: Prisma.ProductSelect;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    page?: number;
    limit?: number;
    filter?: IFilterProduct;
  }): Promise<IPaginatedResult<any>> {
    const prisma = tx ?? this;

    //count total product + bundle
    const [countProducts, countBundles] = await Promise.all([
      prisma.product.count({
        where: { ...where, deletedAt: null },
      }),
      prisma.bundle.count({
        where: { deletedAt: null },
      }),
    ]);

    const total = countProducts + countBundles;
    const lastPage = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // get product + bundle
    const bundlePromise =
      filter?.serviceType !== 'SERVICE'
        ? prisma.bundle.findMany({
            where: {
              deletedAt: null,
              isHide: filter?.isHide && parseFormBoolean(filter?.isHide),
              isActive: filter?.isActive && parseFormBoolean(filter?.isActive),
              items: {
                every: {
                  product: {
                    deletedAt: null,
                    ...(filter?.isActive && {
                      isActive: parseFormBoolean(filter?.isActive),
                    }),
                  },
                },
              },
            },
            select: {
              uuid: true,
              name: true,
              description: true,
              price: true,
              isActive: true,
              createdAt: true,
              bundleImage: { select: { url: true } },
              index: true,
              countTotalSale: true,
              rating: true,
              items: {
                select: {
                  product: {
                    select: {
                      uuid: true,
                      name: true,
                      price: true,
                      productImage: { select: { url: true } },
                      productVariant: { include: { capacity: true } },
                      countTotalSale: true,
                      categoryProduct: true,
                      type: true,
                      model: true,
                      capacity: true,
                    },
                  },
                },
              },
            },
            orderBy,
          })
        : Promise.resolve([]);

    const [products, bundles] = await Promise.all([
      prisma.product.findMany({
        where: { ...where, deletedAt: null },
        select,
        orderBy,
      }),
      bundlePromise,
    ]);

    // combine product + bundle
    const combinedData = [
      ...products.map((p) => ({ ...p, recordType: 'PRODUCT' })),
      ...bundles.map((b) => ({ ...b, recordType: 'BUNDLE' })),
    ];

    // optional: sort global (kalau ada field createdAt / name)
    combinedData.sort((a, b) => {
      return a.createdAt > b.createdAt ? -1 : 1;
    });

    // pagination
    const paginatedData = combinedData.slice(skip, skip + limit);

    return {
      data: paginatedData,
      meta: {
        total,
        lastPage,
        currentPage: page,
        perPage: limit,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    };
  }

  async findByUnique({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ProductWhereUniqueInput;
    select?: Prisma.ProductSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.product.findUnique({
      where: { ...where, deletedAt: null },
      select,
    });
  }

  async findByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.ProductSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.product.findUnique({
      where: { uuid, deletedAt: null },
      select,
    });
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: IUpdateProduct;
  }) {
    const prisma = tx ?? this;

    return await prisma.product.update({
      where: { uuid, deletedAt: null },
      data,
    });
  }

  async findBundleByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.BundleSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.bundle.findUnique({
      where: { uuid, deletedAt: null },
      select,
    });
  }

  async updateBundleByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: Prisma.BundleUpdateInput;
  }) {
    const prisma = tx ?? this;

    return await prisma.bundle.update({
      where: { uuid, deletedAt: null },
      data,
    });
  }
}
