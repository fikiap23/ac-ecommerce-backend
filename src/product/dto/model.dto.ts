import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

export class CreateModelDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateModelDto extends PartialType(CreateModelDto) {}

export class QueryModelDto extends SearchPaginationDto {}
