import { Injectable } from '@nestjs/common';
import { BannerCampaignQuery } from 'src/prisma/queries/banner-campaign/banner-campaign.query';
import {
  ICreateBannerCampaign,
  IFilterBannerCampaign,
  IUpdateBannerCampaign,
} from '../interfaces/banner-campaign.interface';
import { Prisma } from '@prisma/client';
import { whereBannerCampaignGetManyPaginate } from 'src/prisma/queries/banner-campaign/props/where-banner-campaign.prop';
import { CustomError } from 'helpers/http.helper';
import { GatewayService } from 'src/gateway/services/gateway.service';
import { genIdPrefixTimestamp, genSlug } from 'helpers/data.helper';
import { CreateFileStorageBucketDto } from 'src/gateway/dto/gateway-storage-bucket.dto';

@Injectable()
export class BannerCampaignRepository {
  constructor(
    private readonly bannerCampaignQuery: BannerCampaignQuery,
    private readonly gatewayService: GatewayService,
  ) {}

  /*
    |--------------------------------------------------------------------------
    | Banner Campaign Repository
    |--------------------------------------------------------------------------
    */

  async uploadImage(image: Express.Multer.File) {
    const fileName = genIdPrefixTimestamp(genSlug(image.originalname));
    const arg: CreateFileStorageBucketDto = {
      name: fileName,
      access: 'PUBLIC',
      tribe: process.env.TRIBE_STORAGE_BUCKET,
      service: 'e-commerce/',
      module: 'banner-campaign/',
      subFolder: 'images/',
      file: image,
    };
    if (process.env.STORAGE_ENABLE === 'true') {
      await this.gatewayService.httpPostFile(arg);
    }
    return `${process.env.BASE_URL_STORAGE_BUCKET}/files/public/${fileName}`;
  }

  async deleteImage(image: string) {
    // get file name
    const splitted = image.split('/');
    const oldImage = [splitted[splitted.length - 1]];
    // delete
    if (process.env.STORAGE_ENABLE === 'true') {
      await this.gatewayService.httpDeleteFiles(oldImage);
    }
  }

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateBannerCampaign;
  }) {
    return await this.bannerCampaignQuery.create({
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
    filter: IFilterBannerCampaign;
    select?: Prisma.BannerCampaignSelect;
  }) {
    const { sort, page, limit } = filter;

    const { where } = whereBannerCampaignGetManyPaginate(filter);

    return await this.bannerCampaignQuery.findManyPaginate({
      tx,
      where,
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
    select?: Prisma.BannerCampaignSelect;
  }) {
    const result = await this.bannerCampaignQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Banner Campaign Tidak Ditemukan!',
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
    data: IUpdateBannerCampaign;
  }) {
    return await this.bannerCampaignQuery.updateByUuid({
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
    return await this.bannerCampaignQuery.deleteByUuid({ tx, uuid });
  }
}
