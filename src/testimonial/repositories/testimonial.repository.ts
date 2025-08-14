import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ICreateTestimonial,
  IUpdateTestimonial,
  IFilterTestimonial,
} from '../interface/testimonial.interface';
import { TestimonialQuery } from 'src/prisma/queries/testimonial/testimonial.query';
import { whereTestimonialGetManyPaginate } from 'src/prisma/queries/testimonial/props/where-testimonial.prop';
import { CustomError } from 'helpers/http.helper';
import { GatewayService } from 'src/gateway/services/gateway.service';
import { genIdPrefixTimestamp, genSlug } from 'helpers/data.helper';
import { CreateFileStorageBucketDto } from 'src/gateway/dto/gateway-storage-bucket.dto';

@Injectable()
export class TestimonialRepository {
  constructor(
    private readonly testimonialQuery: TestimonialQuery,
    private readonly gatewayService: GatewayService,
  ) {}

  /*
    |--------------------------------------------------------------------------
    | Testimonial Repository
    |--------------------------------------------------------------------------
    */

  async uploadVideoOrImage(videoOrImage: Express.Multer.File) {
    const fileName = genIdPrefixTimestamp(genSlug(videoOrImage.originalname));
    const arg: CreateFileStorageBucketDto = {
      name: fileName,
      access: 'PUBLIC',
      tribe: process.env.TRIBE_STORAGE_BUCKET,
      service: 'e-commerce/',
      module: 'testimonial/',
      subFolder: 'media/',
      file: videoOrImage,
    };
    if (process.env.STORAGE_ENABLE === 'true') {
      await this.gatewayService.httpPostFile(arg);
    }
    return `${process.env.BASE_URL_STORAGE_BUCKET}/files/public/${fileName}`;
  }

  async deleteVideoOrImage(videoOrImage: string) {
    const splitted = videoOrImage.split('/');
    const oldFile = [splitted[splitted.length - 1]];
    if (process.env.STORAGE_ENABLE === 'true') {
      await this.gatewayService.httpDeleteFiles(oldFile);
    }
  }

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateTestimonial;
  }) {
    return await this.testimonialQuery.create({
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
    filter: IFilterTestimonial;
    select?: Prisma.TestimonialSelect;
  }) {
    const { sort, page, limit } = filter;

    const { where } = whereTestimonialGetManyPaginate(filter);

    return await this.testimonialQuery.findManyPaginate({
      tx,
      where,
      orderBy: { createdAt: sort },
      select,
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
    select?: Prisma.TestimonialSelect;
  }) {
    const result = await this.testimonialQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Testimonial Tidak Ditemukan!',
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
    data: IUpdateTestimonial;
  }) {
    return await this.testimonialQuery.updateByUuid({
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
    return await this.testimonialQuery.deleteByUuid({ tx, uuid });
  }
}
