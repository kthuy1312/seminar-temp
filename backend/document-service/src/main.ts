import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── Static file serving (/api/documents/files/<filename>) ──
  // Cho phép download file đã upload qua URL trả về
  const uploadsDir = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsDir, {
    prefix: '/api/documents/files',
  });

  // ── Global prefix ──────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Global validation ──────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Global exception filter ────────────────────────────────
  // Bắt cả MulterError, HttpException và các lỗi không xác định
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global response transform ──────────────────────────────
  // Chuẩn hóa tất cả response: { success, data, timestamp }
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── CORS ───────────────────────────────────────────────────
  app.enableCors({ origin: '*', credentials: true });

  const port = process.env.PORT ?? 3004;
  await app.listen(port);

  console.log(`📄 Document Service is running on http://localhost:${port}`);
  console.log(`📁 Files served at  http://localhost:${port}/api/documents/files/<filename>`);
}

bootstrap();
