import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './services/order.service';
import {
  CreateOrderDto,
  DeviceListFilterDto,
  OrderNetDto,
  QueryOrderDto,
  QueryReportSummaryDto,
  QueryReportTransactionStatsDto,
  SetCompleteOrderDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { Response } from 'express';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler, imageFileFilter } from 'helpers/validation.helper';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { TypeRoleAdmin, TypeRoleUser } from '@prisma/client';
import { Roles } from 'src/auth/decorator';
import { OrderPaymentMethodService } from './services/order-payment-method.service';
import { IOrderPayment } from './interfaces/order.interface';
import { AuthService } from 'src/auth/auth.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

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
  @UseGuards(JwtGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Patch('order/status')
  async updateOrder(@Body() dto: UpdateOrderStatusDto, @Res() res: Response) {
    try {
      await this.orderService.updateOrderStatus(dto);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard)
  @Patch('order/complete')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainPhoto', maxCount: 1 },
        { name: 'photos', maxCount: 10 },
      ],
      { fileFilter: imageFileFilter },
    ),
  )
  async setCompleteOrder(
    @Body() dto: SetCompleteOrderDto,
    @UploadedFiles()
    files: {
      mainPhoto?: Express.Multer.File[];
      photos?: Express.Multer.File[];
    },
    @Res() res: Response,
  ) {
    try {
      await this.orderService.setCompleteOrder(dto, {
        mainPhoto: files?.mainPhoto?.[0],
        photos: files?.photos ?? [],
      });
      return formatResponse(res, HttpStatus.OK, null);
    } catch (err) {
      return errorHandler(res, err);
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

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Get('order-summary')
  async getSummary(
    @Query() queries: QueryReportSummaryDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.orderService.getSummary(queries);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Get('order-transaction-stats')
  async getTransactionStats(
    @Query() queries: QueryReportTransactionStatsDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.orderService.getTransactionStats(queries);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard)
  @Get('device/paginate')
  async getDevicePaginate(
    @Query() query: DeviceListFilterDto,
    @Headers('authorization') authorization: string,
    @Res() res: Response,
  ) {
    try {
      const { sub } = await this.authService.decodeJwtToken(authorization);
      const result = await this.orderService.getManyDevicePaginate(sub, query);

      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard)
  @Get('device/:id')
  async getDeviceById(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
    @Res() res: Response,
  ) {
    try {
      const { sub } = await this.authService.decodeJwtToken(authorization);
      const result = await this.orderService.getManyDeviceById(sub, id);

      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      return errorHandler(res, error);
    }
  }
}
