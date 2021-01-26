import { AuthModule } from '@modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gatway';
import { ChatService } from './chat.service';
import { MessageRepository } from './message.repository';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([MessageRepository])],
  controllers: [],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
