import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CustomerRepository } from './repositories/customer.repository';
import { CustomerController } from './customer.controller';
import { GatewayModule } from 'src/gateway/gateway.module';
import { CustomerAddressRepository } from './repositories/customer-address.repository';
import { OrderModule } from 'src/order/order.module';
import { ProductModule } from 'src/product/product.module';
import { CustomerAddressService } from './services/customer-address.service';
import { CustomerOrderService } from './services/customer-order.service';
import { CustomerProfileService } from './services/customer-profile.service';
import { CustomerOrderRepository } from './repositories/customer-order.repository';
import { VoucherModule } from 'src/voucher/voucher.module';
import { CustomerProductRepository } from './repositories/customer-product.repository';
import { CustomerProductService } from './services/customer-product.service';
import { CustomerVoucherRepository } from './repositories/customer-voucher.repository';

@Module({
  imports: [
    JwtModule.register({}),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PrismaModule,
    forwardRef(() => AuthModule),
    GatewayModule,
    forwardRef(() => OrderModule),
    ProductModule,
    VoucherModule,
    OrderModule,
  ],
  providers: [
    CustomerRepository,
    CustomerAddressRepository,
    CustomerProfileService,
    CustomerAddressService,
    CustomerOrderService,
    CustomerOrderRepository,
    CustomerProductRepository,
    CustomerProductService,
    CustomerVoucherRepository,
  ],
  exports: [
    CustomerRepository,
    CustomerAddressRepository,
    CustomerProfileService,
    CustomerVoucherRepository,
  ],
  controllers: [CustomerController],
})
export class CustomerModule {}
