import { PartialType } from '@nestjs/mapped-types';
import { TypeRoleAdmin } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserManagementDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEnum(TypeRoleAdmin)
  @IsNotEmpty()
  role: TypeRoleAdmin;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserManagementDto extends PartialType(
  CreateUserManagementDto,
) {}
