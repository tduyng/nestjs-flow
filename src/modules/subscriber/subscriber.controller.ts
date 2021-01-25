import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Inject,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { ISubscriberService } from './subscriber.interface';

@Controller('subscribers')
@UseInterceptors(ClassSerializerInterceptor)
export class SubscriberController {
  private subscribersService: ISubscriberService;
  constructor(@Inject('SUBSCRIBER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.subscribersService = this.client.getService<ISubscriberService>(
      'SubscriberService',
    );
  }

  @Get()
  public async getSubscribers() {
    return this.subscribersService.getAllSubscribers({});
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  public async createPost(@Body() subscriberDto: CreateSubscriberDto) {
    return this.subscribersService.addSubscriber(subscriberDto);
  }
}
