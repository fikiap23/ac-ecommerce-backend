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
import { TypeService } from '../services/type.service';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { TypeRoleAdmin } from '@prisma/client';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { CreateTypeDto, UpdateTypeDto } from '../dto/type.dto';

@Controller('type')
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Post()
  async createType(@Body() dto: CreateTypeDto, @Res() res: Response) {
    try {
      const result = await this.typeService.create(dto);
      return formatResponse(res, HttpStatus.CREATED, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get()
  async getAllType(@Res() res: Response) {
    try {
      const result = await this.typeService.getAll();
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getTypeByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.typeService.getByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Put(':uuid')
  async updateTypeByUuid(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateTypeDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.typeService.updateByUuid(uuid, dto);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Delete(':uuid')
  async deleteTypeByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      await this.typeService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
