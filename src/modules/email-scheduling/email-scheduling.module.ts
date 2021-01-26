import { Module } from '@nestjs/common';
import { EmailSchedulingController } from './email-scheduling.controller';
import { EmailSchedulingService } from './services/email-scheduling.service';
import { EmailService } from './services/email.service';

@Module({
  controllers: [EmailSchedulingController],
  providers: [EmailService, EmailSchedulingService],
})
export class EmailSchedulingModule {}
