import { EntityRepository, Repository } from 'typeorm';
import { CreateMessageChatDto } from './dto/create-message-chat.dto';
import { Message } from './message.entity';

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
  public async createMessage(createMsgChatDto: CreateMessageChatDto) {
    const newMsg = this.create(createMsgChatDto);
    await this.save(newMsg);
    return newMsg;
  }

  public async getMessages() {
    return await this.find({ relations: ['author'] });
  }
}
