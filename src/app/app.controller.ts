import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log(process.env.JWT_SECRET);
    console.log(process.env.SERVER_PORT);
    console.log(process.env.TYPEORM_CONNECTION);
    console.log(process.env.TYPEORM_MIGRATIONS);
    console.log(process.env.TYPEORM_ENTITIES);
    return this.appService.getHello();
  }
}
