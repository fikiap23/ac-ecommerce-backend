import { Type } from '@nestjs/common';
import { Prisma, TypeBanner } from '@prisma/client';

export type ICreateBannerCampaign = Prisma.BannerCampaignCreateInput;
export type IUpdateBannerCampaign = Prisma.BannerCampaignUpdateInput;

export type IFilterBannerCampaign = {
  sort: Prisma.SortOrder;
  page: number;
  search?: string;
  type?: TypeBanner;
  limit: number;
};
