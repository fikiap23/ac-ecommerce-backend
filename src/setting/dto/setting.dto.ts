import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SocialItemDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value === 'true' : !!value,
  )
  @IsBoolean()
  isActive?: boolean;
}

export class UpsertSettingDto {
  // Company
  @IsOptional()
  @IsString()
  logo?: string; // abaikan, kita simpan file logo dari @UploadedFiles

  @IsOptional()
  @IsString()
  description?: string;

  // Contact
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  // Footer
  @IsOptional()
  @IsString()
  copyrightText?: string;

  // Socials (kirim sebagai JSON string di multipart)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        /* biarkan validator yang menolak */
      }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialItemDto)
  socialMedias?: SocialItemDto[];
}
