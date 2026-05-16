import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ConsoleLogger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

class PrefixLogger extends ConsoleLogger {
  log(message: any, context?: string) { super.log(`[AUTH] ${message}`, context); }
  error(message: any, stackOrContext?: string) { super.error(`[AUTH] ${message}`, stackOrContext); }
  warn(message: any, context?: string) { super.warn(`[AUTH] ${message}`, context); }
  debug(message: any, context?: string) { super.debug(`[AUTH] ${message}`, context); }
  verbose(message: any, context?: string) { super.verbose(`[AUTH] ${message}`, context); }
}

async function bootstrap() {
  process.title = 'AUTH SERVICE';
  const app = await NestFactory.create(AppModule, {
    logger: new PrefixLogger(),
  });
  
  app.setGlobalPrefix('api/auth');
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`
==================================================
🚀 AUTH SERVICE RUNNING
PORT: ${port}
DATABASE: PostgreSQL
JWT: ENABLED
ENV: ${process.env.NODE_ENV || 'DEVELOPMENT'}
==================================================
  `);
}
bootstrap();
