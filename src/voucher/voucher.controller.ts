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
  UseGuards,
} from '@nestjs/common';
import { VoucherService } from './services/voucher.service';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { TypeRoleAdmin, TypeRoleUser } from '@prisma/client';
import {
  CreateVoucherDto,
  QueryVoucherDto,
  UpdateVoucherDto,
} from './dto/voucher.dto';
import { Response } from 'express';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { AuthService } from 'src/auth/auth.service';

@Controller('voucher')
export class VoucherController {
  constructor(
    private readonly voucherService: VoucherService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.SUPER_ADMIN)
  @Post()
  async create(@Body() dto: CreateVoucherDto, @Res() res: Response) {
    try {
      await this.voucherService.create(dto);
      return formatResponse(res, HttpStatus.CREATED, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER, TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Get()
  async getAll(
    @Headers('authorization') authorization: string,
    @Query() queries: QueryVoucherDto,
    @Res() res: Response,
  ) {
    const { sub } = await this.authService.decodeJwtToken(authorization);
    try {
      const result = await this.voucherService.getAll(sub, queries);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER, TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Get(':uuid')
  async getVoucherByUuid(
    @Headers('authorization') authorization: string,
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    const { sub } = await this.authService.decodeJwtToken(authorization);
    try {
      const result = await this.voucherService.getByUuid(sub, uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.SUPER_ADMIN)
  @Put(':uuid')
  async updateVoucherByUuid(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateVoucherDto,
    @Res() res: Response,
  ) {
    try {
      await this.voucherService.updateByUuid(uuid, dto);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.SUPER_ADMIN)
  @Delete(':uuid')
  async deleteVoucherByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      await this.voucherService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
