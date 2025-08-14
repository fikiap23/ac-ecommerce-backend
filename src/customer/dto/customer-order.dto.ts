import { TypeStatusOrder } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

export class QueryCustomerOrderDto extends SearchPaginationDto {
  @IsOptional()
  @IsEnum(TypeStatusOrder)
  status?: TypeStatusOrder;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
