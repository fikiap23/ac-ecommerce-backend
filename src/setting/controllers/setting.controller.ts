import { Response } from 'express';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { Roles } from 'src/auth/decorator';
import { SettingService } from '../services/setting.service';
import { TypeRoleAdmin } from '@prisma/client';
import { UpsertSettingDto } from '../dto/setting.dto';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  async getSetting(@Res() res: Response) {
    try {
      const result = await this.settingService.getSetting();
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @UseInterceptors(AnyFilesInterceptor())
  @Post()
  async upsertSetting(
    @Body() dto: UpsertSettingDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (typeof (dto as any).socialMedias === 'string') {
      try {
        dto.socialMedias = JSON.parse((dto as any).socialMedias);
      } catch {}
    }

    const logo = files.find((f) => f.fieldname === 'logo');

    const iconRegex = /^socialMedias\[(\d+)\](?:\[icon\]|\.icon)$/;
    const socialIconsOrdered: Express.Multer.File[] = files
      .map((f) => {
        const m = f.fieldname.match(iconRegex);
        return m ? { i: Number(m[1]), f } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.i - b!.i)
      .map((x) => x!.f);

    return this.settingService.saveSetting(dto, {
      logo,
      socialIcons: socialIconsOrdered,
    });
  }
}
