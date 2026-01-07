import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayModule } from 'src/gateway/gateway.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { ProvinceController } from './controllers/province.controller';
import { RegencyController } from './controllers/regency.controller';
import { DistrictController } from './controllers/district.controller';
import { VillageController } from './controllers/village.controller';
import { IslandController } from './controllers/island.controller';

import { ProvinceService } from './services/province.service';
import { RegencyService } from './services/regency.service';
import { DistrictService } from './services/district.service';
import { VillageService } from './services/village.service';
import { IslandService } from './services/island.service';

import { ProvinceRepository } from './repositories/province.repository';
import { RegencyRepository } from './repositories/regency.repository';
import { DistrictRepository } from './repositories/district.repository';
import { VillageRepository } from './repositories/village.repository';
import { IslandRepository } from './repositories/island.repository';

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
  controllers: [
    ProvinceController,
    RegencyController,
    DistrictController,
    VillageController,
    IslandController,
  ],
  providers: [
    ProvinceService,
    RegencyService,
    DistrictService,
    VillageService,
    IslandService,
    ProvinceRepository,
    RegencyRepository,
    DistrictRepository,
    VillageRepository,
    IslandRepository,
  ],
  exports: [
    ProvinceService,
    RegencyService,
    DistrictService,
    VillageService,
    IslandService,
    ProvinceRepository,
    RegencyRepository,
    DistrictRepository,
    VillageRepository,
    IslandRepository,
  ],
})
export class MasterDataModule {}
