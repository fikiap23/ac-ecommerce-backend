import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';
import {
  TypeProduct,
  TypeProductPackage,
  TypeProductService,
} from '@prisma/client';

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

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  categoryProductUuid: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TypeProductPackage)
  @IsOptional()
  packageType?: TypeProductPackage = TypeProductPackage.SINGLE;

  @IsEnum(TypeProductService)
  @IsOptional()
  serviceType?: TypeProductService = TypeProductService.PRODUCT;

  @IsEnum(TypeProduct)
  @IsOptional()
  type?: TypeProduct = TypeProduct.INVERTER;

  @IsString()
  @IsOptional()
  model?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  capacity?: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsOptional()
  @IsInt()
  stock: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];

  productImages?: Express.Multer.File[];
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
}
