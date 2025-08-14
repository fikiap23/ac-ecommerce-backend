import {
  IsArray,
  IsBoolean,
  IsEnum,
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
  @IsNumber()
  stock?: number = 0;
}

export class ProductImageData {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductImageData)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return [];
      }
    }
    return value;
  })
  productImageData: ProductImageData[];
}

export class QueryProductDto extends SearchPaginationDto {
  @IsOptional()
  @IsArray()
  categoryUuid?: string[];

  @IsOptional()
  @IsString()
  isActive?: string;
}
