import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { EmailScheduleDto } from '../dto/email-schedule.dto';
import { EmailService } from './email.service';

@Injectable()
export class EmailSchedulingService {
  constructor(
    private readonly emailService: EmailService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  public scheduleEmail(emailSchedule: EmailScheduleDto) {
    const date = new Date(emailSchedule.date);
    const job = new CronJob(date, () => {
      this.emailService.sendMail({
        from: emailSchedule.from,
        to: emailSchedule.to,
        subject: emailSchedule.subject,
        text: emailSchedule.text,
        html: emailSchedule.html,
      });
    });

    this.schedulerRegistry.addCronJob(
      `${Date.now()}-${emailSchedule.subject}`,
      job,
    );
    job.start();
  }

  public cancelAllScheduledEmails() {
    this.schedulerRegistry.getCronJobs().forEach((job) => {
      job.stop();
    });
  }
}
