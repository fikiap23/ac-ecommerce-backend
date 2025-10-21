import { PartialType } from '@nestjs/mapped-types';
import { TypeStatusTestimonial } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

export class CreateTestimonialDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cityOrDistrict: string;

  @IsString()
  @IsNotEmpty()
  productDescription: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsString()
  productUuid: string;

  @IsOptional()
  @IsString()
  orderProductUuid: string;

  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsOptional()
  @IsEnum(TypeStatusTestimonial)
  status?: TypeStatusTestimonial;
}

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}

export class SearchTestimonialDto extends SearchPaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  productUuid?: string;

  @IsOptional()
  @IsEnum(TypeStatusTestimonial)
  status?: TypeStatusTestimonial;
}
