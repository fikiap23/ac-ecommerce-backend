import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayModule } from 'src/gateway/gateway.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrderService } from './services/order.service';
import { OrderController } from './order.controller';
import { ProductModule } from 'src/product/product.module';
import { AuthModule } from 'src/auth/auth.module';
import { VoucherModule } from 'src/voucher/voucher.module';
import { OrderRepository } from './repositories/order.repository';
import { CustomerModule } from 'src/customer/customer.module';
import { MailModule } from 'src/mail/mail.module';
import { OrderPaymentMethodService } from './services/order-payment-method.service';
import { OrderValidateRepository } from './repositories/order-validate.repository';
import { OrderProductRepository } from './repositories/order-product.repository';
import { OrderCallbackPaymentRepository } from './repositories/order-callback-payment.repository';
import { OrderDeliveryServiceRepository } from './repositories/order-delivery-service.repository';
import { OrderPaymentMethodRepository } from './repositories/order-payment-method.repository';

@Module({
  imports: [
    JwtModule.register({}),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PrismaModule,
    GatewayModule,
    forwardRef(() => AuthModule),
    ProductModule,
    VoucherModule,
    forwardRef(() => CustomerModule),
    MailModule,
  ],
  providers: [
    OrderDeliveryServiceRepository,
    OrderPaymentMethodRepository,
    OrderRepository,
    OrderService,
    OrderPaymentMethodService,
    OrderValidateRepository,
    OrderProductRepository,
    OrderCallbackPaymentRepository,
  ],
  controllers: [OrderController],
  exports: [OrderRepository, OrderCallbackPaymentRepository],
})
export class OrderModule {}
