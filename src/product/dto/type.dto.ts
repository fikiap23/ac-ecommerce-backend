import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

export class CreateTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateTypeDto extends PartialType(CreateTypeDto) {}

export class QueryTypeDto extends SearchPaginationDto {}
