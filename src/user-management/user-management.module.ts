import { Module } from '@nestjs/common';
import { UserManagementService } from './services/user-management.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserManagementRepository } from './repositories/user-management.repository';
import { UserManagementController } from './user-management.controller';

@Module({
  imports: [
    JwtModule.register({}),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PrismaModule,
  ],
  providers: [UserManagementRepository, UserManagementService],
  controllers: [UserManagementController],
  exports: [UserManagementRepository, UserManagementService],
})
export class UserManagementModule {}
