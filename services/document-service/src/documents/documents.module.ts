import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { TextExtractorService } from './text-extractor.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'document_events_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, TextExtractorService],
  exports: [DocumentsService, TextExtractorService],
})
export class DocumentsModule {}
