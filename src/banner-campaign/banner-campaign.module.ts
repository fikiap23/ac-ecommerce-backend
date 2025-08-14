import { Module } from '@nestjs/common';
import { BannerCampaignService } from './services/banner-campaign.service';
import { BannerCampaignController } from './banner-campaign.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BannerCampaignRepository } from './repositories/banner-campaign.repository';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { GatewayModule } from 'src/gateway/gateway.module';
import { BannerCampaignValidateRepository } from './repositories/banner-campaign-validate.repository';

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
  providers: [
    BannerCampaignService,
    BannerCampaignRepository,
    BannerCampaignValidateRepository,
  ],
  controllers: [BannerCampaignController],
})
export class BannerCampaignModule {}
