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
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { formatResponse } from 'helpers/http.helper';
import { Response } from 'express';
import { errorHandler, imageFileFilter } from 'helpers/validation.helper';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateCustomerDto } from './dto/customer.dto';
import { TypeRoleUser } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';
import { CustomerAddressService } from './services/customer-address.service';
import { CustomerOrderService } from './services/customer-order.service';
import {
  CreateCustomerAddressDto,
  UpdateCustomerAddressDto,
} from './dto/customer-address.dto';
import { CustomerProfileService } from './services/customer-profile.service';
import { QueryCustomerOrderDto } from './dto/customer-order.dto';
import { CustomerProductService } from './services/customer-product.service';
import {
  CreateCustomerProductDto,
  UpdateCustomerProductDto,
} from './dto/customer-product.dto';

@Controller('customer')
export class CustomerController {
  constructor(
    private readonly authService: AuthService,
    private readonly customerProfileService: CustomerProfileService,
    private readonly customerAddressService: CustomerAddressService,
    private readonly customerOrderService: CustomerOrderService,
    private readonly customerProductService: CustomerProductService,
  ) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Get('profile')
  async getProfileByUuid(
    @Headers('authorization') authorization: string,
    @Res() res: Response,
  ) {
    const { sub } = await this.authService.decodeJwtToken(authorization);
    try {
      const result = await this.customerProfileService.getByUuid(sub);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Put('profile')
  @UseInterceptors(FileInterceptor('image', { fileFilter: imageFileFilter }))
  async updateProfleByUuid(
    @Body() dto: UpdateCustomerDto,
    @Headers('authorization') authorization: string,
    @Res() res: Response,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    try {
      const { sub } = await this.authService.decodeJwtToken(authorization);

      await this.customerProfileService.updateByUuid(sub, dto, image);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Post('cart')
  async addToCart(
    @Headers('authorization') authorization: string,
    @Body() dto: CreateCustomerProductDto,
    @Res() res: Response,
  ) {
    const { sub } = await this.authService.decodeJwtToken(authorization);
    try {
      await this.customerProductService.create(sub, dto);
      return formatResponse(res, HttpStatus.CREATED, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Get('cart')
  async getCart(
    @Headers('authorization') authorization: string,
    @Res() res: Response,
  ) {
    const { sub } = await this.authService.decodeJwtToken(authorization);
    try {
      const result = await this.customerProductService.getMany(sub);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Put('cart/:uuid')
  async updateCart(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateCustomerProductDto,
    @Res() res: Response,
  ) {
    try {
      await this.customerProductService.updateByUuid(uuid, dto);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Delete('cart/:uuid')
  async deleteCart(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      await this.customerProductService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Post('address')
  async createAddress(
    @Headers('authorization') authorization: string,
    @Body() dto: CreateCustomerAddressDto,
    @Res() res: Response,
  ) {
    const { sub } = await this.authService.decodeJwtToken(authorization);
    try {
      await this.customerAddressService.create(sub, dto);
      return formatResponse(res, HttpStatus.CREATED, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Get('address')
  async getAddress(
    @Headers('authorization') authorization: string,
    @Query() queries: SearchPaginationDto,
    @Res() res: Response,
  ) {
    const { sub } = await this.authService.decodeJwtToken(authorization);
    try {
      const result = await this.customerAddressService.getAll(sub, queries);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Get('address/:uuid')
  async getAddressByUuid(
    @Headers('authorization') authorization: string,
    @Param('uuid') addressUuid: string,
    @Res() res: Response,
  ) {
    const { sub } = await this.authService.decodeJwtToken(authorization);
    try {
      const result = await this.customerAddressService.getByUuid(
        sub,
        addressUuid,
      );
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Put('address/:uuid')
  async updateAddressByUuid(
    @Headers('authorization') authorization: string,
    @Param('uuid') addressUuid: string,
    @Body() dto: UpdateCustomerAddressDto,
    @Res() res: Response,
  ) {
    const { sub } = await this.authService.decodeJwtToken(authorization);
    try {
      await this.customerAddressService.updateByUuid(sub, addressUuid, dto);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Delete('address/:uuid')
  async deleteAddressByUuid(
    @Headers('authorization') authorization: string,
    @Param('uuid') addressUuid: string,
    @Res() res: Response,
  ) {
    const { sub } = await this.authService.decodeJwtToken(authorization);
    try {
      await this.customerAddressService.deleteByUuid(sub, addressUuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Get('order')
  async getOrder(
    @Headers('authorization') authorization: string,
    @Query() queries: QueryCustomerOrderDto,
    @Res() res: Response,
  ) {
    const { sub } = await this.authService.decodeJwtToken(authorization);
    try {
      const result = await this.customerOrderService.getAll(sub, queries);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
