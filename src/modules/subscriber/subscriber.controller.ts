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
import { ClientProxy } from '@nestjs/microservices';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';

@Controller('subscribers')
@UseInterceptors(ClassSerializerInterceptor)
export class SubscriberController {
  constructor(
    @Inject('SUBSCRIBER_SERVICE') private subscribersService: ClientProxy,
  ) {}

  @Get()
  public async getSubscribers() {
    return this.subscribersService.send(
      {
        cmd: 'get-subscribers',
      },
      '',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  public async createPost(@Body() subscriberDto: CreateSubscriberDto) {
    return this.subscribersService.send(
      {
        cmd: 'add-subscriber',
      },
      subscriberDto,
    );
  }
}
