import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

export class CreateCategoryProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateCategoryProductDto extends PartialType(
  CreateCategoryProductDto,
) {}

export class QueryCategoryProductDto extends SearchPaginationDto {}
