import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { DriverService } from '../services/driver.service';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { TypeRoleAdmin } from '@prisma/client';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { CreateDriverDto, UpdateDriverDto } from '../dto/driver.dto';

@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Post()
  async createDriver(@Body() dto: CreateDriverDto, @Res() res: Response) {
    try {
      const result = await this.driverService.create(dto);
      return formatResponse(res, HttpStatus.CREATED, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get()
  async getAllDriver(@Res() res: Response) {
    try {
      const result = await this.driverService.getAll();
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getDriverByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.driverService.getByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Put(':uuid')
  async updateDriverByUuid(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateDriverDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.driverService.updateByUuid(uuid, dto);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Delete(':uuid')
  async deleteDriverByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      await this.driverService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
