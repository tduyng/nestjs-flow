import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailSchedulingController } from './email-scheduling.controller';
import { EmailSchedulingService } from './services/email-scheduling.service';
import { EmailService } from './services/email.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [EmailSchedulingController],
  providers: [EmailService, EmailSchedulingService],
})
export class EmailSchedulingModule {}
