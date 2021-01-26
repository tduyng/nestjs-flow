import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EmailScheduleDto } from './dto/email-schedule.dto';
import { EmailSchedulingService } from './services/email-scheduling.service';

@Controller('email-scheduling')
export class EmailSchedulingController {
  constructor(
    private readonly emailSchedulingService: EmailSchedulingService,
  ) {}

  @Post('schedule')
  @UseGuards(JwtAuthGuard)
  public scheduleEmail(@Body() emailSchedule: EmailScheduleDto) {
    this.emailSchedulingService.scheduleEmail(emailSchedule);
  }
}
