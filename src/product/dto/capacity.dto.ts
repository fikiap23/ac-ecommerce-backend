import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

export class CreateCapacityDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateCapacityDto extends PartialType(CreateCapacityDto) {}

export class QueryCapacityDto extends SearchPaginationDto {}
