import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class OrderSubDistrictQuery {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  subDistrict: string;
}

export class OrderDeliveryServiceQuery {
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
  weight: string;

  @IsString()
  @IsNotEmpty()
  goodsValue: string;
}
