import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

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

  const port = Number(process.env.PORT || 3008);
  await app.listen(port);
  logger.log(`Dashboard Service is running on http://localhost:${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
