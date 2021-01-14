import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(1776, () => {
    console.log(`Server is running at http://localhost:1776/`);
  });
}
bootstrap();
