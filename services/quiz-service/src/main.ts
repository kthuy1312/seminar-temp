import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const port = process.env.PORT ?? 3006; // Use 3006 for quiz-service
  await app.listen(port);
  console.log(`Quiz service is running on: http://localhost:${port}`);
}
bootstrap();
