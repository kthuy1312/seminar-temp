import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

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

  const port = process.env.PORT || 3005;
  await app.listen(port);
  logger.log(`Summary Service is running on http://localhost:${port}`);
}
bootstrap();
