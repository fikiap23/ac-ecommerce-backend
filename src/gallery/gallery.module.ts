import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { GatewayModule } from 'src/gateway/gateway.module';
import { GalleryRepository } from './repository/gallery.repository';
import { GalleryService } from './services/gallery.service';
import { GalleryController } from './controllers/gallery.controller';

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
  providers: [GalleryService, GalleryRepository],
  controllers: [GalleryController],
})
export class GalleryModule {}
