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
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';

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

  @UseGuards(JwtGuard, RoleGuard)
  @Patch('order/complete')
  @UseInterceptors(
    AnyFilesInterceptor({
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async setComplete(
    @Body() dto: SetCompleteOrderDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      // items[0][images] , items[0][images] (boleh berulang), items[1][images], dst.
      const imgRe = /^items\[(\d+)]\[images]$/;

      const bucket: Record<number, Express.Multer.File[]> = {};
      for (const f of files || []) {
        const m = f.fieldname.match(imgRe);
        if (m) {
          const i = Number(m[1]);
          (bucket[i] ||= []).push(f);
        }
      }

      // urutkan sesuai index items[] di DTO; item tanpa file -> []
      const filesByItem = (dto.items ?? []).map((_, i) => bucket[i] ?? []);

      await this.orderService.setCompleteOrder(dto, filesByItem);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (e) {
      return errorHandler(res, e);
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

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Get('device/paginate/:uuid')
  async getDevicePaginateByUser(
    @Query() query: DeviceListFilterDto,
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.orderService.getManyDevicePaginate(uuid, query);

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
      let { sub, role } = await this.authService.decodeJwtToken(authorization);

      if (role === TypeRoleAdmin.ADMIN || role === TypeRoleAdmin.SUPER_ADMIN) {
        sub = undefined;
      }

      const result = await this.orderService.getManyDeviceById(sub, id);

      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      return errorHandler(res, error);
    }
  }
}
