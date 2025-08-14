import { PartialType } from '@nestjs/mapped-types';
import { TypeStatusVoucher, TypeVoucher } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';
import { IVoucherOrderBy } from '../interfaces/voucher.interface';

class ProductUuidDto {
  @IsString()
  @IsNotEmpty()
  productUuid: string;
}

export class CreateVoucherDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @IsEnum(TypeVoucher)
  @IsNotEmpty()
  type: TypeVoucher;

  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'discountAmount cannot be negative' })
  discountAmount: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'minimumAmount cannot be negative' })
  minimumAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductUuidDto)
  @IsOptional()
  items: ProductUuidDto[];

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'discountMax cannot be negative' })
  maxDiscount: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'quota cannot be negative' })
  quota: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'claimLimitPerUser cannot be negative' })
  claimLimitPerUser: number;
}

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {}

export class QueryVoucherDto extends SearchPaginationDto {
  @IsOptional()
  @IsEnum(TypeVoucher)
  type?: TypeVoucher;

  @IsOptional()
  @IsEnum(TypeStatusVoucher)
  status?: TypeStatusVoucher;

  @IsOptional()
  orderBy?: IVoucherOrderBy;
}
