import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BannerCampaignService } from './services/banner-campaign.service';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { TypeRoleAdmin } from '@prisma/client';
import {
  CreateBannerCampaignDto,
  UpdateBannerCampaignDto,
} from './dto/banner-campaign.dto';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler, imageFileFilter } from 'helpers/validation.helper';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchPaginationDto } from '../../utils/dto/pagination.dto';

@Controller('banner-campaign')
export class BannerCampaignController {
  constructor(private readonly bannerCampaignService: BannerCampaignService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image', { fileFilter: imageFileFilter }))
  async create(
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: CreateBannerCampaignDto,
    @Res() res: Response,
  ) {
    try {
      await this.bannerCampaignService.create(dto, image);
      return formatResponse(res, HttpStatus.CREATED, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get()
  async getAll(@Query() queries: SearchPaginationDto, @Res() res: Response) {
    try {
      const result = await this.bannerCampaignService.getAll(queries);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getBannerCampaignByUuid(
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.bannerCampaignService.getByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Put(':uuid')
  @UseInterceptors(FileInterceptor('image', { fileFilter: imageFileFilter }))
  async updateBannerCampaignByUuid(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateBannerCampaignDto,
    @Res() res: Response,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    try {
      await this.bannerCampaignService.updateByUuid(uuid, dto, image);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Delete(':uuid')
  async deleteBannerCampaignByUuid(
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      await this.bannerCampaignService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
