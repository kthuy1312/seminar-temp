import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { TextExtractorService } from './text-extractor.service';

@Module({
  imports: [],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    TextExtractorService,
    {
      provide: 'RABBITMQ_CLIENT',
      useFactory: () => {
        if (process.env.ENABLE_RABBITMQ === 'true') {
          return ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
              queue: 'document_events_queue',
              queueOptions: {
                durable: true,
              },
            },
          });
        }
        // Return a mock client that does nothing when RabbitMQ is disabled
        return {
          emit: () => ({ subscribe: () => {} }),
          connect: () => Promise.resolve(),
          close: () => {},
        };
      },
    },
  ],
  exports: [DocumentsService, TextExtractorService],
})
export class DocumentsModule {}
