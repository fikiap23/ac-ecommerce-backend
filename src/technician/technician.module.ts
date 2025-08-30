import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayModule } from 'src/gateway/gateway.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TechnicianService } from './services/technician.service';
import { TechnicianRepository } from './repositories/technician.repository';
import { TechnicianController } from './controllers/technician.controller';

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
  providers: [TechnicianService, TechnicianRepository],
  controllers: [TechnicianController],
  exports: [TechnicianService, TechnicianRepository],
})
export class TechnicianModule {}
