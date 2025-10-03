import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Length(8, 20)
  phone?: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UpdateMessageDto extends PartialType(CreateMessageDto) {}

export class QueryMessageDto extends SearchPaginationDto {}
