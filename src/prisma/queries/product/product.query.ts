import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IPaginatedResult } from 'src/prisma/interfaces/paginated-result.interface';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ICreateProduct,
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
    const [products, bundles] = await Promise.all([
      prisma.product.findMany({
        where: { ...where, deletedAt: null },
        select,
        orderBy,
      }),
      prisma.bundle.findMany({
        where: { deletedAt: null },
        select: {
          uuid: true,
          name: true,
          description: true,
          price: true,
          isActive: true,
          createdAt: true,
          bundleImage: { select: { url: true } },
          items: {
            select: {
              product: {
                select: {
                  uuid: true,
                  name: true,
                  price: true,
                  productImage: { select: { url: true } },
                },
              },
            },
          },
        },
        orderBy,
      }),
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
}
