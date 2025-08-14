import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VoucherRepository } from './repositories/voucher.repository';
import { VoucherService } from './services/voucher.service';
import { VoucherController } from './voucher.controller';
import { ProductModule } from 'src/product/product.module';
import { VoucherValidateRepository } from './repositories/voucher-validate.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    JwtModule.register({}),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PrismaModule,
    ProductModule,
    forwardRef(() => AuthModule),
  ],
  providers: [VoucherRepository, VoucherService, VoucherValidateRepository],
  controllers: [VoucherController],
  exports: [VoucherService, VoucherRepository],
})
export class VoucherModule {}
