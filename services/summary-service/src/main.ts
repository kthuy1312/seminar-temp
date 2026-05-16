import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsoleLogger, Logger } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

class PrefixLogger extends ConsoleLogger {
  log(message: any, context?: string) { super.log(`[SUMMARY] ${message}`, context); }
  error(message: any, stackOrContext?: string) { super.error(`[SUMMARY] ${message}`, stackOrContext); }
  warn(message: any, context?: string) { super.warn(`[SUMMARY] ${message}`, context); }
  debug(message: any, context?: string) { super.debug(`[SUMMARY] ${message}`, context); }
  verbose(message: any, context?: string) { super.verbose(`[SUMMARY] ${message}`, context); }
}

async function bootstrap() {
  process.title = 'SUMMARY SERVICE';
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: new PrefixLogger(),
  });
  app.useGlobalInterceptors(new TransformInterceptor());

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: false,
  });

  // Configure RabbitMQ Microservice ONLY if enabled
  if (process.env.ENABLE_RABBITMQ === 'true') {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'document_events_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    app.startAllMicroservices()
      .then(() => logger.log('Summary Microservice is listening to RabbitMQ'))
      .catch(err => logger.error('RabbitMQ connection failed', err));
  } else {
    logger.warn('RabbitMQ is DISABLED. Event-based summarization will not work.');
  }

  const port = process.env.PORT || 3006;
  await app.listen(port);
  
  console.log(`
==================================================
🚀 SUMMARY SERVICE RUNNING
PORT: ${port}
GEMINI: ENABLED
DATABASE: Prisma (PostgreSQL)
==================================================
  `);
}
bootstrap();
