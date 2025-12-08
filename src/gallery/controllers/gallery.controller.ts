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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { TypeRoleAdmin } from '@prisma/client';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from 'helpers/validation.helper';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';
import { GalleryService } from '../services/gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image', { fileFilter: imageFileFilter }))
  async create(
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      await this.galleryService.create(image);
      return formatResponse(res, HttpStatus.CREATED, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Post('bulk')
  @UseInterceptors(
    FilesInterceptor('images', 20, { fileFilter: imageFileFilter }),
  )
  async createMany(
    @UploadedFiles() images: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      await this.galleryService.createMany(images);
      return formatResponse(res, HttpStatus.CREATED, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get()
  async getAll(@Res() res: Response) {
    try {
      const result = await this.galleryService.getAll();
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.galleryService.getByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Put(':uuid')
  @UseInterceptors(FileInterceptor('image', { fileFilter: imageFileFilter }))
  async updateByUuid(
    @Param('uuid') uuid: string,
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      await this.galleryService.updateByUuid(uuid, image);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Delete(':uuid')
  async deleteByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      await this.galleryService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
