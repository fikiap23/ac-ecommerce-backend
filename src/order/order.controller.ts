import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './services/order.service';
import { CreateOrderDto, OrderNetDto, QueryOrderDto } from './dto/order.dto';
import { Response } from 'express';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { TypeRoleAdmin, TypeRoleUser } from '@prisma/client';
import { Roles } from 'src/auth/decorator';
import { OrderPaymentMethodService } from './services/order-payment-method.service';
import { IOrderPayment } from './interfaces/order.interface';
import { AuthService } from 'src/auth/auth.service';

@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderPaymentMethodService: OrderPaymentMethodService,
    private readonly authService: AuthService,
  ) {}

  @Get('payment-method')
  async getAllPaymentMethod(@Res() res: Response) {
    try {
      const result = await this.orderPaymentMethodService.getAll();
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard)
  @Roles(TypeRoleUser.CUSTOMER)
  @Post('order')
  async createOrder(
    @Headers('authorization') authorization: string,
    @Body() dto: CreateOrderDto,
    @Res() res: Response,
  ) {
    try {
      const { sub } = await this.authService.decodeJwtToken(authorization);
      const result = await this.orderService.createOrder(sub, dto);
      return formatResponse(res, HttpStatus.CREATED, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Get('order')
  async getAllOrders(@Query() queries: QueryOrderDto, @Res() res: Response) {
    try {
      const result = await this.orderService.getAllOrders(queries);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Post('order-net')
  async orderNet(@Body() dto: OrderNetDto, @Res() res: Response) {
    try {
      await this.orderService.netOrder(dto);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Get('order/:uuid')
  async getOrderByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.orderService.getOrderByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get('order/track/:trackId')
  async getOrderByTrackId(
    @Param('trackId') trackId: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.orderService.getOrderByTrackId(trackId);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get('order/payment/:trackId')
  async getPayment(@Param('trackId') trackId: string, @Res() res: Response) {
    try {
      const result = await this.orderService.getPayment(trackId);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Post('order/cancel/:trackId')
  async orderCancel(@Param('trackId') trackId: string, @Res() res: Response) {
    try {
      await this.orderService.orderCancel(trackId);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Post('order-payment')
  async orderPayment(
    @Headers('X-CALLBACK-TOKEN') token: string,
    @Body() dto: IOrderPayment,
    @Res() res: Response,
  ) {
    try {
      console.log('Webhook from Xendit:', dto);
      const result = await this.orderService.orderPayment(token, dto);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
