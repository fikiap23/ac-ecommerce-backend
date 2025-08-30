import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

export class CreateTechnicianDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateTechnicianDto extends PartialType(CreateTechnicianDto) {}

export class QueryTechnicianDto extends SearchPaginationDto {}
