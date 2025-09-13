import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';
import { TypeProductPackage, TypeProductService } from '@prisma/client';

export class CreateProductVariantDto {
  @IsOptional()
  @IsString()
  uuid?: string;

  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsInt()
  stock: number;

  @Type(() => Number)
  @IsNumber()
  regularPrice: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsString()
  specification?: string;

  image?: Express.Multer.File[];
}

export class BundlingItemDto {
  @IsString()
  @IsNotEmpty()
  productUuid: string;
}

export class CreateProductDto {
  @IsEnum(TypeProductPackage)
  @IsNotEmpty()
  packageType?: TypeProductPackage;

  @ValidateIf((o) => o.packageType === TypeProductPackage.SINGLE)
  @IsEnum(TypeProductService)
  @IsNotEmpty()
  serviceType?: TypeProductService;

  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateIf((o) => o.packageType !== TypeProductPackage.BUNDLE)
  @IsString()
  @IsNotEmpty()
  categoryProductUuid: string;

  @ValidateIf((o) => o.serviceType === TypeProductService.PRODUCT)
  @IsString()
  @IsNotEmpty()
  brand?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  typeUuid?: string;

  @IsString()
  @IsOptional()
  modelUuid?: string;

  @IsString()
  @IsOptional()
  capacityUuid?: string;

  @ValidateIf((o) => o.packageType !== TypeProductPackage.BUNDLE)
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsOptional()
  rating: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsString()
  @IsOptional()
  isActive?: string;

  @IsString()
  @IsOptional()
  isHide?: string;

  @ValidateIf((o) => o.serviceType === TypeProductService.PRODUCT)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];

  productImages?: Express.Multer.File[];

  @ValidateIf((o) => o.packageType === TypeProductPackage.BUNDLE)
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundlingItemDto)
  bundlingItems: BundlingItemDto[];

  @ValidateIf((o) => o.packageType === TypeProductPackage.BUNDLE)
  @IsNumber()
  bundlingMinusPrice: number;
}

export class ProductImageData {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class QueryProductDto extends SearchPaginationDto {
  @IsOptional()
  @IsArray()
  categoryUuid?: string[];

  @IsOptional()
  @IsString()
  isActive?: string;

  @IsOptional()
  @IsString()
  isHide?: string;

  @IsOptional()
  @IsString()
  typeUuid: string;

  @IsOptional()
  @IsString()
  modelUuid: string;

  @IsOptional()
  @IsString()
  capacityUuid: string;

  @IsEnum(TypeProductService)
  @IsOptional()
  serviceType?: TypeProductService;
}

export class RemoveVariantDto {
  @IsString()
  uuidProduct: string;

  @IsString()
  uuidVariant: string;
}
