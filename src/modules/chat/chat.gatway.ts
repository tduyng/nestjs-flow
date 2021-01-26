import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateMessageChatDto } from './dto/create-message-chat.dto';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly chatService: ChatService) {}

  public async handleConnection(socket: Socket) {
    await this.chatService.getUserFromSocket(socket);
  }

  @SubscribeMessage('send-message')
  public async listenForMessages(
    @MessageBody() content: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const author = await this.chatService.getUserFromSocket(socket);
    const messageDto: CreateMessageChatDto = {
      content: content,
      author: author,
    };
    const message = await this.chatService.createMessage(messageDto);
    this.server.sockets.emit('receive_message', message);
  }

  @SubscribeMessage('request-all-messages')
  public async requestAllMessages(@ConnectedSocket() socket: Socket) {
    await this.chatService.getUserFromSocket(socket);
    const messages = await this.chatService.getMessages();
    socket.emit('send_all_messages', messages);
  }
}
