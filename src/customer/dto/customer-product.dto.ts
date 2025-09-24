import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class BundleProductItemDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsOptional()
  variantUuid?: string;
}

export class CreateCustomerProductDto {
  // === MODE PRODUCT ===
  @ValidateIf((o) => !o.bundleUuid)
  @IsString()
  @IsNotEmpty()
  productUuid?: string;

  @ValidateIf((o) => !o.bundleUuid)
  @IsString()
  @IsOptional()
  productVariantUuid?: string;

  // === MODE BUNDLE ===
  @ValidateIf((o) => !o.productUuid)
  @IsString()
  @IsNotEmpty()
  bundleUuid?: string;

  @ValidateIf((o) => !!o.bundleUuid)
  @ValidateNested({ each: true })
  @Type(() => BundleProductItemDto)
  @IsOptional()
  productBundles?: BundleProductItemDto[];

  // COMMON
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
