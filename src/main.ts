import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { setupSwagger } from '@common/config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  // attaches cookies to request object
  app.use(cookieParser());
  // applies security hardening settings. using defaults: https://www.npmjs.com/package/helmet
  app.use(helmet());
  app.setGlobalPrefix('api');
  setupSwagger(app);
  const port = process.env.SERVER_PORT;
  await app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
  });
}
bootstrap();
