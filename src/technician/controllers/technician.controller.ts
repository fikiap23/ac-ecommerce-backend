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
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { TypeRoleAdmin } from '@prisma/client';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import {
  CreateTechnicianDto,
  UpdateTechnicianDto,
} from '../dto/technician.dto';
import { TechnicianService } from '../services/technician.service';

@Controller('technician')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Post()
  async createTechnician(
    @Body() dto: CreateTechnicianDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.technicianService.create(dto);
      return formatResponse(res, HttpStatus.CREATED, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get()
  async getAllTechnician(@Res() res: Response) {
    try {
      const result = await this.technicianService.getAll();
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getTechnicianByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.technicianService.getByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Put(':uuid')
  async updateTechnicianByUuid(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateTechnicianDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.technicianService.updateByUuid(uuid, dto);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Delete(':uuid')
  async deleteTechnicianByUuid(
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      await this.technicianService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
