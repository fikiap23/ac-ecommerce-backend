import { PartialType } from '@nestjs/mapped-types';
import { TypeProductService } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

export class CreateCategoryProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TypeProductService)
  @IsOptional()
  type?: TypeProductService;
}

export class UpdateCategoryProductDto extends PartialType(
  CreateCategoryProductDto,
) {}

export class QueryCategoryProductDto extends SearchPaginationDto {}
