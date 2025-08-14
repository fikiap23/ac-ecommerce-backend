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
  UseGuards,
} from '@nestjs/common';
import { UserManagementService } from './services/user-management.service';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import {
  CreateUserManagementDto,
  UpdateUserManagementDto,
} from './dto/user-management.dto';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { Response } from 'express';
import { TypeRoleAdmin } from '@prisma/client';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Controller('user-management')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.SUPER_ADMIN)
  @Post()
  async create(@Body() dto: CreateUserManagementDto, @Res() res: Response) {
    try {
      await this.userManagementService.create(dto);
      return formatResponse(res, HttpStatus.CREATED, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.SUPER_ADMIN)
  @Get()
  async getAll(@Query() queries: SearchPaginationDto, @Res() res: Response) {
    try {
      const result = await this.userManagementService.getAll(queries);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.SUPER_ADMIN)
  @Get(':uuid')
  async getUserManagementByUuid(
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.userManagementService.getByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.SUPER_ADMIN)
  @Put(':uuid')
  async updateUserManagementByUuid(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateUserManagementDto,
    @Res() res: Response,
  ) {
    try {
      await this.userManagementService.updateByUuid(uuid, dto);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.SUPER_ADMIN)
  @Delete(':uuid')
  async deleteUserManagementByUuid(
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      await this.userManagementService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
