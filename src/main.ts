import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.SERVER_PORT;
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  // attaches cookies to request object
  app.use(cookieParser());
  // applies security hardening settings. using defaults: https://www.npmjs.com/package/helmet
  app.use(helmet());
  await app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
  });
}
bootstrap();
