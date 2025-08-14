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
import { TestimonialService } from './services/testimonial.service';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { TypeRoleAdmin } from '@prisma/client';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto';
import { formatResponse } from 'helpers/http.helper';
import {
  errorHandler,
  videoOrImageFileFilter,
} from 'helpers/validation.helper';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Controller('testimonial')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Post()
  @UseInterceptors(
    FileInterceptor('videoOrImage', { fileFilter: videoOrImageFileFilter }),
  )
  async create(
    @UploadedFile() videoOrImage: Express.Multer.File,
    @Body() dto: CreateTestimonialDto,
    @Res() res: Response,
  ) {
    try {
      await this.testimonialService.create(dto, videoOrImage);
      return formatResponse(res, HttpStatus.CREATED, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get()
  async getAll(@Query() queries: SearchPaginationDto, @Res() res: Response) {
    try {
      const result = await this.testimonialService.getAll({
        sort: queries.sort,
        page: queries.page,
        limit: queries.limit,
        search: queries.search,
      });
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getTestimonialByUuid(
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.testimonialService.getByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Put(':uuid')
  @UseInterceptors(
    FileInterceptor('videoOrImage', { fileFilter: videoOrImageFileFilter }),
  )
  async updateTestimonialByUuid(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateTestimonialDto,
    @Res() res: Response,
    @UploadedFile() videoOrImage?: Express.Multer.File,
  ) {
    try {
      await this.testimonialService.updateByUuid(uuid, dto, videoOrImage);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Delete(':uuid')
  async deleteTestimonialByUuid(
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      await this.testimonialService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
