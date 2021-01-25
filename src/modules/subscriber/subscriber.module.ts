import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { SubscriberController } from './subscriber.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [SubscriberController],
  providers: [
    {
      provide: 'SUBSCRIBER_PACKAGE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.GRPC,
          options: {
            package: 'subscriber',
            protoPath: join(
              process.cwd(),
              'src/modules/subscriber/subscribers.proto',
            ),
            url: process.env.GRPC_CONNECTION_URL,
          },
        });
      },
    },
  ],
})
export class SubscriberModule {}
