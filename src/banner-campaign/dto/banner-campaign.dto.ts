import { PartialType } from '@nestjs/mapped-types';
import { TypeBanner } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

export class CreateBannerCampaignDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(TypeBanner)
  @IsNotEmpty()
  type: TypeBanner;

  @IsOptional()
  @IsString()
  link?: string;
}

export class UpdateBannerCampaignDto extends PartialType(
  CreateBannerCampaignDto,
) {}

export class SearchBannerCampaignDto extends SearchPaginationDto {
  @IsEnum(TypeBanner)
  @IsOptional()
  type?: TypeBanner;
}
