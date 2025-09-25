import { PartialType } from '@nestjs/mapped-types';
import { TypeBanner } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateBannerCampaignDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(TypeBanner)
  @IsNotEmpty()
  type: TypeBanner;
}

export class UpdateBannerCampaignDto extends PartialType(
  CreateBannerCampaignDto,
) {}
