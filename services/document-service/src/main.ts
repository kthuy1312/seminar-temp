import { NestFactory } from '@nestjs/core';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

class PrefixLogger extends ConsoleLogger {
  log(message: any, context?: string) { super.log(`[DOCUMENT] ${message}`, context); }
  error(message: any, stackOrContext?: string) { super.error(`[DOCUMENT] ${message}`, stackOrContext); }
  warn(message: any, context?: string) { super.warn(`[DOCUMENT] ${message}`, context); }
  debug(message: any, context?: string) { super.debug(`[DOCUMENT] ${message}`, context); }
  verbose(message: any, context?: string) { super.verbose(`[DOCUMENT] ${message}`, context); }
}

async function bootstrap() {
  process.title = 'DOCUMENT SERVICE';
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new PrefixLogger(),
  });

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
  app.enableCors({ origin: '*', credentials: false });

  const port = process.env.PORT ?? 3003;
  await app.listen(port);

  console.log(`
==================================================
🚀 DOCUMENT SERVICE RUNNING
PORT: ${port}
DATABASE: Prisma (PostgreSQL)
FILES: http://localhost:${port}/api/documents/files/<filename>
==================================================
  `);
}

bootstrap();
