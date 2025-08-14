import { Prisma } from '@prisma/client';
import { IFilterBannerCampaign } from 'src/banner-campaign/interfaces/banner-campaign.interface';

export const whereBannerCampaignGetManyPaginate = (
  props: IFilterBannerCampaign,
) => {
  const { search } = props;

  const where: Prisma.BannerCampaignWhereInput = {};

  if (search && search.trim() !== '') {
    where.OR = [
      {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  return { where };
};
