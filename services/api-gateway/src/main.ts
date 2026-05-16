import { NestFactory } from '@nestjs/core';
import { ConsoleLogger } from '@nestjs/common';
import { AppModule } from './app.module';

class PrefixLogger extends ConsoleLogger {
  log(message: any, context?: string) { super.log(`[GATEWAY] ${message}`, context); }
  error(message: any, stackOrContext?: string) { super.error(`[GATEWAY] ${message}`, stackOrContext); }
  warn(message: any, context?: string) { super.warn(`[GATEWAY] ${message}`, context); }
  debug(message: any, context?: string) { super.debug(`[GATEWAY] ${message}`, context); }
  verbose(message: any, context?: string) { super.verbose(`[GATEWAY] ${message}`, context); }
}

async function bootstrap() {
  process.title = 'API GATEWAY';
  // IMPORTANT: bodyParser must be disabled so http-proxy-middleware can
  // forward the raw body stream to upstream services.
  const app = await NestFactory.create(AppModule, { 
    bodyParser: false,
    logger: new PrefixLogger(),
  });

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3100',
    credentials: false,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
==================================================
⚡ API GATEWAY RUNNING
PORT: ${port}
ROLE: Reverse Proxy
AUTH: JWT Middleware
==================================================
  `);
}

bootstrap();
