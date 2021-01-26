import { AuthService } from '@modules/auth/auth.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { parse } from 'cookie';
import { Socket } from 'socket.io';
import { CreateMessageChatDto } from './dto/create-message-chat.dto';
import { MessageRepository } from './message.repository';

@Injectable()
export class ChatService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(MessageRepository)
    private messageRepo: MessageRepository,
  ) {}

  public async getMessages() {
    return await this.messageRepo.getMessages();
  }

  public async createMessage(messageDto: CreateMessageChatDto) {
    const newMessage = await this.messageRepo.createMessage(messageDto);
    return newMessage;
  }

  public async getUserFromSocket(socket: Socket) {
    try {
      const cookie = socket?.handshake?.headers?.cookie;
      const { Authorization: authToken } = parse(cookie);
      const user = await this.authService.getUserFromAuthToken(authToken);
      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }
      return user;
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
