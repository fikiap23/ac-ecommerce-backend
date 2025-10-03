import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayModule } from 'src/gateway/gateway.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessageService } from './services/message.service';
import { MessageRepository } from './repositories/message.repository';
import { MessageController } from './controllers/message.controller';
import { MessageQuery } from 'src/prisma/queries/message/message.query';

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
  providers: [MessageService, MessageRepository, MessageQuery],
  controllers: [MessageController],
  exports: [MessageService, MessageRepository],
})
export class MessageModule {}
