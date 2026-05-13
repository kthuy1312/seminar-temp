import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/auth');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if unknown properties
      transform: true,            // Auto-transform payloads to DTO instances
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transform
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🔐 Auth Service is running on http://localhost:${port}`);
}

bootstrap();
