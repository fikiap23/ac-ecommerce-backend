import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayModule } from 'src/gateway/gateway.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DriverService } from './services/driver.service';
import { DriverRepository } from './repositories/driver.repository';
import { DriverController } from './controllers/driver.controller';

@Module({
  imports: [
    JwtModule.register({}),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PrismaModule,
    GatewayModule,
  ],
  providers: [DriverService, DriverRepository],
  controllers: [DriverController],
  exports: [DriverService, DriverRepository],
})
export class DriverModule {}
