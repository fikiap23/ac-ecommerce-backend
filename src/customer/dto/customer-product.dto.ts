import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCustomerProductDto {
  @IsString()
  @IsNotEmpty()
  productUuid: string;

  @IsString()
  @IsNotEmpty()
  productVariantUuid: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsNumber()
  @Min(1, { message: 'Quantity minimal 1' })
  @IsNotEmpty()
  quantity: number;
}

export class UpdateCustomerProductDto extends PartialType(
  CreateCustomerProductDto,
) {}
