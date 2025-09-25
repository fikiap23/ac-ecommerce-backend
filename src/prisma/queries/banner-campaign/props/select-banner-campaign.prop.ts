import { Prisma } from '@prisma/client';

export const selectGeneralBannerCampaign: Prisma.BannerCampaignSelect = {
  uuid: true,
  title: true,
  image: true,
  type: true,
  createdAt: true,
  updatedAt: true,
};
