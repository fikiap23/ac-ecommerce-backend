import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomerQuery } from 'src/prisma/queries/customer/customer.query';
import {
  ICreateCustomer,
  IFilterCustomer,
  IUpdateCustomer,
} from '../interfaces/customer.interface';
import { CustomError } from 'helpers/http.helper';
import { genIdPrefixTimestamp, genSlug } from 'helpers/data.helper';
import { CreateFileStorageBucketDto } from 'src/gateway/dto/gateway-storage-bucket.dto';
import { GatewayService } from 'src/gateway/services/gateway.service';
import { whereCustomerGetManyPaginate } from 'src/prisma/queries/customer/props/where-customer.prop';

@Injectable()
export class CustomerRepository {
  constructor(
    private readonly customerQuery: CustomerQuery,
    private readonly gatewayService: GatewayService,
  ) {}

  /*
    |--------------------------------------------------------------------------
    | Customer Repository
    |--------------------------------------------------------------------------
    */

  async checkProfilePictureFromStorage(urlImage: string) {
    return urlImage?.includes(
      `${process.env.BASE_URL_STORAGE_BUCKET}/files/public`,
    );
  }

  async uploadProfilePicture(image: Express.Multer.File) {
    const fileName = genIdPrefixTimestamp(genSlug(image.originalname));
    const arg: CreateFileStorageBucketDto = {
      name: fileName,
      access: 'PUBLIC',
      tribe: process.env.TRIBE_STORAGE_BUCKET,
      service: 'e-commerce/',
      module: 'customer/',
      subFolder: 'images/',
      file: image,
    };
    if (process.env.STORAGE_ENABLE === 'true') {
      await this.gatewayService.httpPostFile(arg);
    }
    return `${process.env.BASE_URL_STORAGE_BUCKET}/files/public/${fileName}`;
  }

  async deleteProfilePicture(urlImage: string) {
    const splitted = urlImage.split('/');
    const oldImage = [splitted[splitted.length - 1]];
    if (process.env.STORAGE_ENABLE === 'true') {
      await this.gatewayService.httpDeleteFiles(oldImage);
    }
  }

  async getByEmail({
    tx,
    email,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    email: string;
    select?: Prisma.CustomerSelect;
  }) {
    return await this.customerQuery.findByEmail({ tx, email, select });
  }

  async getThrowById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.CustomerSelect;
  }) {
    const result = await this.customerQuery.findById({ tx, id, select });

    if (!result) {
      throw new CustomError({
        message: 'Customer Tidak Ditemukan!',
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
    select?: Prisma.CustomerSelect;
  }) {
    const result = await this.customerQuery.findByUuid({ tx, uuid, select });

    if (!result) {
      throw new CustomError({
        message: 'Customer Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async isEmailUnique({
    tx,
    email,
    excludeUuid,
  }: {
    tx?: Prisma.TransactionClient;
    email: string;
    excludeUuid?: string;
  }) {
    const customer = await this.customerQuery.isEmailUnique({
      tx,
      email,
      excludeUuid,
    });

    if (customer) {
      throw new CustomError({
        message: 'Email sudah digunakan',
        statusCode: 409,
      });
    }

    return;
  }

  async isPhoneNumberUnique({
    tx,
    phoneNumber,
    excludeUuid,
  }: {
    tx?: Prisma.TransactionClient;
    phoneNumber: string;
    excludeUuid?: string;
  }) {
    const customer = await this.customerQuery.isPhoneNumberUnique({
      tx,
      phoneNumber,
      excludeUuid,
    });
    if (customer) {
      throw new CustomError({
        message: 'Nomor Telepon sudah digunakan',
        statusCode: 409,
      });
    }

    return;
  }

  async getMany({
    tx,
    where,
    select,
    orderBy,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.CustomerWhereInput;
    select?: Prisma.CustomerSelect;
    orderBy?: Prisma.CustomerOrderByWithRelationInput;
  }) {
    return await this.customerQuery.findManyPaginate({
      tx,
      where,
      select,
      orderBy,
    });
  }

  async getManyPaginate({
    tx,
    filter,
    where: additionalWhere,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IFilterCustomer;
    where?: Prisma.CustomerWhereInput;
    select?: Prisma.CustomerSelect;
  }) {
    const { sort, page, limit, orderBy } = filter;

    const { where } = whereCustomerGetManyPaginate(filter);

    const combinedWhere: Prisma.CustomerWhereInput = {
      AND: [where, additionalWhere].filter(Boolean),
    };

    return await this.customerQuery.findManyPaginate({
      tx,
      where: combinedWhere,
      select,
      orderBy: { createdAt: sort },
      page,
      limit,
    });
  }

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateCustomer;
  }) {
    return await this.customerQuery.create({ tx, data });
  }

  async updateById({
    tx,
    id,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: IUpdateCustomer;
  }) {
    return await this.customerQuery.updateById({ tx, id, data });
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: IUpdateCustomer;
  }) {
    return await this.customerQuery.updateByUuid({ tx, uuid, data });
  }

  async updateByEmail({
    tx,
    email,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    email: string;
    data: IUpdateCustomer;
  }) {
    return await this.customerQuery.updateByEmail({ tx, email, data });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    return await this.customerQuery.deleteByUuid({ tx, uuid });
  }
}
