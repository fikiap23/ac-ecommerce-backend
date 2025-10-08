import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
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
import { TypeStatusOrder } from '@prisma/client';

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  subDistrict: string;

  @IsString()
  @IsNotEmpty()
  suburbOrVillage: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  details?: string;
}

export class CartItemDto {
  @IsString()
  @IsOptional()
  cartUuid?: string;
}

export class CartItemProductDto {
  @IsString()
  @IsOptional()
  productUuid?: string;

  @IsString()
  @IsOptional()
  bundleUuid?: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  productVariantUuid?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsOptional()
  shippingAddress?: ShippingAddressDto;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsOptional()
  recipientAddress?: ShippingAddressDto;

  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  @IsNotEmpty()
  carts: CartItemDto[];

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @IsNotEmpty()
  deliveryService: string;

  @IsString()
  @IsOptional()
  voucherUuid?: string;

  @IsNumber()
  @IsNotEmpty()
  subTotalPay: number;

  @IsNumber()
  @IsOptional()
  voucherDiscount?: number;

  @IsNumber()
  @IsNotEmpty()
  deliveryFee: number;

  @IsNumber()
  @IsNotEmpty()
  totalPayment: number;
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

export class QueryOrderDto extends SearchPaginationDto {
  @IsOptional()
  @IsEnum(TypeStatusOrder)
  status?: TypeStatusOrder;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class OrderNetDto {
  @IsNotEmpty()
  @IsString()
  startDate?: string;

  @IsNotEmpty()
  @IsString()
  endDate?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  orderUuid: string;

  @IsEnum(TypeStatusOrder)
  status: TypeStatusOrder;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  spk?: string;
}

export class UpdateOrderProductItemDto {
  @IsString()
  @IsNotEmpty()
  orderProductUuid: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  driverUuid?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technicianUuids?: string[];
}

export class UpdateOrderProductByUuidDto {
  @IsString()
  @IsNotEmpty()
  orderUuid: string;

  @ValidateNested({ each: true })
  @Type(() => UpdateOrderProductItemDto)
  items: UpdateOrderProductItemDto[];
}

export class DeviceListFilterDto extends SearchPaginationDto {
  @IsOptional()
  @IsString()
  orderUuid?: string;
}

export class QueryReportSummaryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class QueryReportTransactionStatsDto {
  @IsOptional()
  @IsString()
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @IsOptional()
  @IsString()
  by: 'revenue' | 'qty';

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class QueryReportRecentTransactionDto extends SearchPaginationDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class SetOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  orderUuid: string;

  @IsEnum(TypeStatusOrder)
  status: TypeStatusOrder;
}

export class CompleteOrderItemDto {
  @IsString()
  @IsNotEmpty()
  orderProductUuid: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  // readings / misc
  @IsOptional() freonBefore?: number;
  @IsOptional() freonAfter?: number;
  @IsOptional() tempBefore?: number;
  @IsOptional() tempAfter?: number;
  @IsOptional() currentBefore?: number;
  @IsOptional() currentAfter?: number;
  @IsOptional() @IsString() remarks?: string;

  // relasi personel per item
  @IsOptional()
  @IsString()
  driverUuid?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technicianUuids?: string[];

  // gambar
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  replaceImages?: string[];
}

export class CompleteOrderProductsDto {
  @IsString()
  @IsNotEmpty()
  orderUuid: string;

  @ValidateNested({ each: true })
  @Type(() => CompleteOrderItemDto)
  items: CompleteOrderItemDto[];
}
