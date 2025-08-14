import { PartialType } from '@nestjs/mapped-types';
import { TypeRoleUser } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';
import { ICustomerOrderBy } from '../interfaces/customer.interface';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  profilePic: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class QueryCustomerDto extends SearchPaginationDto {
  @IsOptional()
  @IsString()
  orderBy?: ICustomerOrderBy;

  @IsOptional()
  @IsNumber()
  mission?: number;

  @IsOptional()
  @IsEnum(TypeRoleUser)
  role?: TypeRoleUser;
}
