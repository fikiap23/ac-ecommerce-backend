import {
  IsBoolean,
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
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  recipientAddress: ShippingAddressDto;

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
}

export class OrderNetDto {
  @IsNotEmpty()
  @IsString()
  startDate?: string;

  @IsNotEmpty()
  @IsString()
  endDate?: string;
}

export class UpdateProductOrderDeviceDto {
  @IsString()
  orderProductUuid: string;

  @IsString()
  deviceId: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  orderUuid: string;

  @IsOptional()
  @IsEnum(TypeStatusOrder)
  status?: TypeStatusOrder;

  @IsOptional()
  @IsString()
  technicianUuid?: string;

  @IsOptional()
  @IsString()
  driverUuid?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  scheduleAt?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductOrderDeviceDto)
  productOrders?: UpdateProductOrderDeviceDto[];
}

export class SetCompleteOrderDto {
  @IsString()
  @IsNotEmpty()
  orderUuid: string;

  @IsOptional()
  @IsEnum(TypeStatusOrder)
  status?: TypeStatusOrder;

  @IsOptional()
  scheduleAt?: string;

  @IsOptional()
  @IsString()
  task?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  freonBefore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  freonAfter?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tempBefore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tempAfter?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentBefore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentAfter?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  replaceImages?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductOrderDeviceDto)
  productOrders?: UpdateProductOrderDeviceDto[];
}
