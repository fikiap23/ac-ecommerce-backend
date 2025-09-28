import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GatewayModule } from 'src/gateway/gateway.module';

import { SettingService } from './services/setting.service';
import { SettingController } from './controllers/setting.controller';
import { SettingSocialRepository } from './repositories/setting-social.repository';
import { SiteSettingRepository } from './repositories/site-setting.repository';

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
  providers: [SettingService, SettingSocialRepository, SiteSettingRepository],
  controllers: [SettingController],
  exports: [SettingService, SettingSocialRepository, SiteSettingRepository],
})
export class SettingModule {}
