import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateDriverDto extends PartialType(CreateDriverDto) {}

export class QueryDriverDto extends SearchPaginationDto {}
