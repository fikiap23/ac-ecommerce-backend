import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CategoryProductQuery } from 'src/prisma/queries/product/category-product.query';
import { whereCategoryProductGetManyPaginate } from 'src/prisma/queries/product/props/where-category-product.prop';
import {
  ICreateCategoryProduct,
  IFilterCategoryProduct,
  IUpdateCategoryProduct,
} from '../interfaces/category-product.interface';
import { CustomError } from 'helpers/http.helper';

@Injectable()
export class CategoryProductRepository {
  constructor(private readonly categoryProductQuery: CategoryProductQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Category Product Repository
    |--------------------------------------------------------------------------
    */

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateCategoryProduct;
  }) {
    return await this.categoryProductQuery.create({
      tx,
      data,
    });
  }

  async getManyPaginate({
    tx,
    filter,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IFilterCategoryProduct;
    select?: Prisma.CategoryProductSelect;
  }) {
    const { sort, page, limit } = filter;

    const { where } = whereCategoryProductGetManyPaginate(filter);

    return await this.categoryProductQuery.findManyPaginate({
      tx,
      where,
      orderBy: { createdAt: sort },
      select,
      page,
      limit,
    });
  }

  async getThrowById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.CategoryProductSelect;
  }) {
    const result = await this.categoryProductQuery.findById({
      tx,
      id,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Category Product Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.CategoryProductSelect;
  }) {
    const result = await this.categoryProductQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Category Product Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: IUpdateCategoryProduct;
  }) {
    return await this.categoryProductQuery.updateByUuid({
      tx,
      uuid,
      data,
    });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    return await this.categoryProductQuery.deleteByUuid({ tx, uuid });
  }
}
