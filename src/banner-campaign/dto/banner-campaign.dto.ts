import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateBannerCampaignDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class UpdateBannerCampaignDto extends PartialType(
  CreateBannerCampaignDto,
) {}
