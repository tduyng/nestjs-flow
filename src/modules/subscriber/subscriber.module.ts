import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { SubscriberController } from './subscriber.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [SubscriberController],
  providers: [
    {
      provide: 'SUBSCRIBER_SERVICE',
      useFactory: () => {
        const user = process.env.RABBITMQ_USER;
        const password = process.env.RABBITMQ_PASSWORD;
        const host = process.env.RABBITMQ_HOST;
        const queueName = process.env.RABBITMQ_QUEUE_NAME;
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${user}:${password}@${host}`],
            queue: queueName,
            queueOptions: {
              durable: true,
            },
          },
        });
      },
    },
  ],
})
export class SubscriberModule {}
