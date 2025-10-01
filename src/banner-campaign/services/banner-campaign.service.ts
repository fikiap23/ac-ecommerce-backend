import { Injectable } from '@nestjs/common';
import { BannerCampaignRepository } from '../repositories/banner-campaign.repository';
import {
  CreateBannerCampaignDto,
  UpdateBannerCampaignDto,
} from '../dto/banner-campaign.dto';
import { IFilterBannerCampaign } from '../interfaces/banner-campaign.interface';
import { selectGeneralBannerCampaign } from 'src/prisma/queries/banner-campaign/props/select-banner-campaign.prop';
import { BannerCampaignValidateRepository } from '../repositories/banner-campaign-validate.repository';

@Injectable()
export class BannerCampaignService {
  constructor(
    private readonly bannerCampaignValidateRepository: BannerCampaignValidateRepository,
    private readonly bannerCampaignRepository: BannerCampaignRepository,
  ) {}

  async create(dto: CreateBannerCampaignDto, image: Express.Multer.File) {
    this.bannerCampaignValidateRepository.validateImage(image);
    const urlImage = await this.bannerCampaignRepository.uploadImage(image);
    return await this.bannerCampaignRepository.create({
      data: {
        title: dto.title,
        image: urlImage,
        type: dto.type,
        link: dto.link,
      },
    });
  }

  async getAll(filter: IFilterBannerCampaign) {
    return await this.bannerCampaignRepository.getManyPaginate({
      filter,
      select: selectGeneralBannerCampaign,
    });
  }

  async getByUuid(uuid: string) {
    return await this.bannerCampaignRepository.getThrowByUuid({
      uuid,
      select: selectGeneralBannerCampaign,
    });
  }

  async updateByUuid(
    uuid: string,
    dto: UpdateBannerCampaignDto,
    image?: Express.Multer.File,
  ) {
    const existBanner = await this.bannerCampaignRepository.getThrowByUuid({
      uuid,
    });
    let urlImage: string | undefined;
    if (image) {
      await this.bannerCampaignRepository.deleteImage(existBanner.image);
      urlImage = await this.bannerCampaignRepository.uploadImage(image);
    }
    return await this.bannerCampaignRepository.updateByUuid({
      uuid,
      data: {
        title: dto.title,
        image: urlImage,
        type: dto.type,
        link: dto.link,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    const existBanner = await this.bannerCampaignRepository.getThrowByUuid({
      uuid,
    });
    await this.bannerCampaignRepository.deleteImage(existBanner.image);
    return await this.bannerCampaignRepository.deleteByUuid({ uuid });
  }
}
