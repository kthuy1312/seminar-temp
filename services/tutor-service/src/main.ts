import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

class PrefixLogger extends ConsoleLogger {
  log(message: any, context?: string) { super.log(`[TUTOR] ${message}`, context); }
  error(message: any, stackOrContext?: string) { super.error(`[TUTOR] ${message}`, stackOrContext); }
  warn(message: any, context?: string) { super.warn(`[TUTOR] ${message}`, context); }
  debug(message: any, context?: string) { super.debug(`[TUTOR] ${message}`, context); }
  verbose(message: any, context?: string) { super.verbose(`[TUTOR] ${message}`, context); }
}

async function bootstrap() {
  process.title = 'TUTOR SERVICE';
  const app = await NestFactory.create(AppModule, {
    logger: new PrefixLogger(),
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: false,
  });

  const port = process.env.PORT || 3007;
  await app.listen(port);
  
  console.log(`
==================================================
🚀 TUTOR SERVICE RUNNING
PORT: ${port}
GEMINI: ENABLED
DATABASE: Prisma (PostgreSQL)
==================================================
  `);
}
bootstrap();
