import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductQuery } from 'src/prisma/queries/product/product.query';
import {
  ICreateProduct,
  IFilterProduct,
  IUpdateProduct,
} from '../interfaces/product.interface';
import { whereProductGetManyPaginate } from 'src/prisma/queries/product/props/where-product.prop';
import { CustomError } from 'helpers/http.helper';
import { GatewayService } from 'src/gateway/services/gateway.service';
import { genIdPrefixTimestamp, genSlug } from 'helpers/data.helper';

@Injectable()
export class ProductRepository {
  constructor(
    private readonly productQuery: ProductQuery,
    private readonly gatewayService: GatewayService,
  ) {}

  async uploadBulkProductImages(productImages: Express.Multer.File[]) {
    const imagePayload = productImages.map((img) => {
      const fileName = genIdPrefixTimestamp(genSlug(img.originalname));
      return {
        filesEntity: {
          name: fileName,
          access: 'PUBLIC' as const,
          tribe: process.env.TRIBE_STORAGE_BUCKET,
          service: 'e-commerce/',
          module: 'product/',
          subFolder: 'images/',
        },
        files: img,
      };
    });
    if (process.env.STORAGE_ENABLE === 'true') {
      await this.gatewayService.httpPostBulkFiles(imagePayload);
    }
    return imagePayload
      .map(
        (p) =>
          `${process.env.BASE_URL_STORAGE_BUCKET}/files/public/${p.filesEntity.name}`,
      )
      .map((url) => ({ url }));
  }

  async uploadBulkProductSalesImages(salesImages: Express.Multer.File[]) {
    const salesImagePayload = salesImages.map((img) => {
      const fileName = genIdPrefixTimestamp(genSlug(img.originalname));
      return {
        filesEntity: {
          name: fileName,
          access: 'PUBLIC' as const,
          tribe: process.env.TRIBE_STORAGE_BUCKET,
          service: 'e-commerce/',
          module: 'product/',
          subFolder: 'sales/',
        },
        files: img,
      };
    });
    if (process.env.STORAGE_ENABLE === 'true') {
      await this.gatewayService.httpPostBulkFiles(salesImagePayload);
    }
    return salesImagePayload.map(
      (p) =>
        `${process.env.BASE_URL_STORAGE_BUCKET}/files/public/${p.filesEntity.name}`,
    );
  }

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateProduct;
  }) {
    return await this.productQuery.create({
      tx,
      data,
    });
  }

  async getMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.ProductWhereInput;
    select?: Prisma.ProductSelect;
  }) {
    return await this.productQuery.findMany({ tx, where, select });
  }

  async getManyPaginate({
    tx,
    filter,
    select,
    where: additionWhere,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IFilterProduct;
    select?: Prisma.ProductSelect;
    where?: Prisma.ProductWhereInput;
  }) {
    const { sort, page, limit } = filter;

    const { where } = whereProductGetManyPaginate(filter);

    const combinedWhere: Prisma.ProductWhereInput = {
      AND: [where, additionWhere].filter(Boolean),
    };

    return await this.productQuery.findManyPaginate({
      tx,
      where: combinedWhere,
      select,
      orderBy: { createdAt: sort },
      page,
      limit,
    });
  }

  async getThrowByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.ProductSelect;
  }) {
    const result = await this.productQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Product Tidak Ditemukan!',
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
    data: IUpdateProduct;
  }) {
    return await this.productQuery.updateByUuid({
      tx,
      uuid,
      data,
    });
  }
}
