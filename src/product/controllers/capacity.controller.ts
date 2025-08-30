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
import { CapacityService } from '../services/capacity.service';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { TypeRoleAdmin } from '@prisma/client';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { CreateCapacityDto, UpdateCapacityDto } from '../dto/capacity.dto';

@Controller('capacity')
export class CapacityController {
  constructor(private readonly capacityService: CapacityService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Post()
  async createCapacity(@Body() dto: CreateCapacityDto, @Res() res: Response) {
    try {
      const result = await this.capacityService.create(dto);
      return formatResponse(res, HttpStatus.CREATED, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get()
  async getAllCapacity(@Res() res: Response) {
    try {
      const result = await this.capacityService.getAll();
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getCapacityByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.capacityService.getByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Put(':uuid')
  async updateCapacityByUuid(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateCapacityDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.capacityService.updateByUuid(uuid, dto);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Delete(':uuid')
  async deleteCapacityByUuid(
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      await this.capacityService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
