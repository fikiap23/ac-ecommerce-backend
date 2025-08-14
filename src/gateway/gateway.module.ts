import { Module } from '@nestjs/common';
import { GatewayStorageBucketRepository } from './repositories/gateway-storage-bucket.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GatewayService } from './services/gateway.service';
import { GatewayXenditRepository } from './repositories/gateway-xendit.repository';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [],
  providers: [
    GatewayStorageBucketRepository,
    GatewayXenditRepository,
    GatewayService,
  ],
  exports: [
    GatewayStorageBucketRepository,
    GatewayXenditRepository,
    GatewayService,
  ],
})
export class GatewayModule {}
