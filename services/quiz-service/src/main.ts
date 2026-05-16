import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

class PrefixLogger extends ConsoleLogger {
  log(message: any, context?: string) { super.log(`[QUIZ] ${message}`, context); }
  error(message: any, stackOrContext?: string) { super.error(`[QUIZ] ${message}`, stackOrContext); }
  warn(message: any, context?: string) { super.warn(`[QUIZ] ${message}`, context); }
  debug(message: any, context?: string) { super.debug(`[QUIZ] ${message}`, context); }
  verbose(message: any, context?: string) { super.verbose(`[QUIZ] ${message}`, context); }
}

async function bootstrap() {
  process.title = 'QUIZ SERVICE';
  const app = await NestFactory.create(AppModule, {
    logger: new PrefixLogger(),
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: false,
  });

  const port = process.env.PORT ?? 3005;
  await app.listen(port);
  
  console.log(`
==================================================
🚀 QUIZ SERVICE RUNNING
PORT: ${port}
GEMINI: ENABLED
DATABASE: Prisma (PostgreSQL)
==================================================
  `);
}
bootstrap();
