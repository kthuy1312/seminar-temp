import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: false,
  });

  const port = process.env.PORT ?? 3005;
  await app.listen(port);
  console.log(`❓ Quiz service is running on: http://localhost:${port}`);
}
bootstrap();
