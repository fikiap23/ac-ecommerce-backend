import { Module } from '@nestjs/common';
import { TestimonialService } from './services/testimonial.service';
import { TestimonialController } from './testimonial.controller';
import { TestimonialRepository } from './repositories/testimonial.repository';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { TestimonialValidateRepository } from './repositories/testimonial-validate.repository';

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
    TestimonialService,
    TestimonialRepository,
    TestimonialValidateRepository,
  ],
  controllers: [TestimonialController],
})
export class TestimonialModule {}
