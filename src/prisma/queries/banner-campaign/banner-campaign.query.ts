import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ICreateBannerCampaign,
  IUpdateBannerCampaign,
} from 'src/banner-campaign/interfaces/banner-campaign.interface';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class BannerCampaignQuery extends PrismaService {
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateBannerCampaign;
  }) {
    const prisma = tx ?? this;
    return await prisma.bannerCampaign.create({ data });
  }

  async findManyPaginate({
    tx,
    where,
    select,
    orderBy,
    page,
    limit,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.BannerCampaignWhereInput;
    select?: Prisma.BannerCampaignSelect;
    orderBy?: Prisma.BannerCampaignOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return paginate(
      prisma.bannerCampaign,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async findByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.BannerCampaignSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.bannerCampaign.findUnique({
      where: { uuid },
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
    data: IUpdateBannerCampaign;
  }) {
    const prisma = tx ?? this;
    return await prisma.bannerCampaign.update({ where: { uuid }, data });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    const prisma = tx ?? this;
    return await prisma.bannerCampaign.delete({ where: { uuid } });
  }
}
