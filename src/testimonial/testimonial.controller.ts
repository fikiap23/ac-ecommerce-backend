import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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
import { TypeRoleAdmin, TypeRoleUser } from '@prisma/client';
import {
  CreateTestimonialDto,
  SearchTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { Response } from 'express';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';
import { AuthService } from 'src/auth/auth.service';

@Controller('testimonial')
export class TestimonialController {
  constructor(
    private readonly testimonialService: TestimonialService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN, TypeRoleUser.CUSTOMER)
  @Post()
  async create(
    @Body() dto: CreateTestimonialDto,
    @Headers('authorization') authorization: string,
    @Res() res: Response,
  ) {
    try {
      const { sub, role } = await this.authService.decodeJwtToken(
        authorization,
      );
      await this.testimonialService.create(sub, role, dto);
      return formatResponse(res, HttpStatus.CREATED, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get()
  async getAll(@Query() queries: SearchTestimonialDto, @Res() res: Response) {
    try {
      const result = await this.testimonialService.getAll(queries);
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
  async updateTestimonialByUuid(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateTestimonialDto,
    @Res() res: Response,
  ) {
    try {
      await this.testimonialService.update(uuid, dto);
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
