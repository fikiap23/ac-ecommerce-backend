import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { MomentModule } from '@ccmos/nestjs-moment';
import { AuthModule } from './auth/auth.module';
import { BannerCampaignModule } from './banner-campaign/banner-campaign.module';
import { GatewayModule } from './gateway/gateway.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { ProductModule } from './product/product.module';
import { CustomerModule } from './customer/customer.module';
import { UserManagementModule } from './user-management/user-management.module';
import { VoucherModule } from './voucher/voucher.module';
import { OrderModule } from './order/order.module';
import { MailModule } from './mail/mail.module';
import { DriverModule } from './driver/driver.module';
import { TechnicianModule } from './technician/technician.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MomentModule.forRoot({
      tz: 'Asia/Jakarta',
    }),
    AuthModule,
    BannerCampaignModule,
    GatewayModule,
    TestimonialModule,
    ProductModule,
    CustomerModule,
    UserManagementModule,
    VoucherModule,
    OrderModule,
    MailModule,
    DriverModule,
    TechnicianModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
