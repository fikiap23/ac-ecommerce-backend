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
import { ModelService } from '../services/model.service';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { TypeRoleAdmin } from '@prisma/client';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { CreateModelDto, UpdateModelDto } from '../dto/model.dto';

@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Post()
  async createModel(@Body() dto: CreateModelDto, @Res() res: Response) {
    try {
      const result = await this.modelService.create(dto);
      return formatResponse(res, HttpStatus.CREATED, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get()
  async getAllModel(@Res() res: Response) {
    try {
      const result = await this.modelService.getAll();
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getModelByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.modelService.getByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Put(':uuid')
  async updateModelByUuid(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateModelDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.modelService.updateByUuid(uuid, dto);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Delete(':uuid')
  async deleteModelByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      await this.modelService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
