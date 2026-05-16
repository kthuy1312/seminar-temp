import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

class PrefixLogger extends ConsoleLogger {
  log(message: any, context?: string) { super.log(`[DASHBOARD] ${message}`, context); }
  error(message: any, stackOrContext?: string) { super.error(`[DASHBOARD] ${message}`, stackOrContext); }
  warn(message: any, context?: string) { super.warn(`[DASHBOARD] ${message}`, context); }
  debug(message: any, context?: string) { super.debug(`[DASHBOARD] ${message}`, context); }
  verbose(message: any, context?: string) { super.verbose(`[DASHBOARD] ${message}`, context); }
}

async function bootstrap() {
  process.title = 'DASHBOARD SERVICE';
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: new PrefixLogger(),
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Dashboard Service API')
    .setDescription('Aggregated stats and activity APIs')
    .setVersion('1.0.0')
    .addTag('dashboard')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  if (process.env.ENABLE_RABBITMQ !== 'false') {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: process.env.DASHBOARD_QUEUE || 'dashboard_events_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    await app.startAllMicroservices();
    logger.log('Dashboard microservice is listening to RabbitMQ');
  } else {
    logger.warn('RabbitMQ is disabled for Dashboard Service');
  }

  const port = Number(process.env.PORT || 3002);
  await app.listen(port);
  
  console.log(`
==================================================
🚀 DASHBOARD SERVICE RUNNING
PORT: ${port}
TYPE: Internal API
SWAGGER: http://localhost:${port}/api/docs
==================================================
  `);
}

bootstrap();
