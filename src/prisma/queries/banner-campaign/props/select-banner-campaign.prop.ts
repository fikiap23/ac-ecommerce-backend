import { Prisma } from '@prisma/client';

export const selectGeneralBannerCampaign: Prisma.BannerCampaignSelect = {
  uuid: true,
  title: true,
  image: true,
  type: true,
  link: true,
  createdAt: true,
  updatedAt: true,
};
