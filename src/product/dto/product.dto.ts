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
  Min,
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

  @IsString()
  @IsOptional()
  capacityUuid?: string;

  @IsOptional()
  @IsNumber()
  index?: number;

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

  @IsString()
  @IsOptional()
  rating: string;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsString()
  @IsOptional()
  isActive?: string;

  @IsString()
  @IsOptional()
  isHide?: string;

  @IsOptional()
  @IsNumber()
  index?: number;

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

export class ProductImageDataDto {
  @IsString()
  @IsOptional()
  url: string;

  @IsString()
  @IsOptional()
  uuid: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsString()
  @IsOptional()
  isActive?: string;

  @IsArray()
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
  @IsOptional()
  productImageData?: ProductImageDataDto[];
}

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

export class IndexItemDto {
  @IsString()
  uuid: string;

  @IsInt()
  @Min(0)
  index: number;
}

export class ReorderCatalogDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IndexItemDto)
  items: IndexItemDto[];
}
