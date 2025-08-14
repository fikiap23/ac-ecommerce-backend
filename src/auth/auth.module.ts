import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from './../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { MomentModule } from '@ccmos/nestjs-moment';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { CustomerModule } from 'src/customer/customer.module';
import { UserManagementModule } from 'src/user-management/user-management.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    JwtModule.register({}),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PrismaModule,
    MomentModule,
    ConfigModule,
    forwardRef(() => CustomerModule),
    UserManagementModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
