import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { TextExtractorService } from './text-extractor.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, TextExtractorService],
  exports: [DocumentsService, TextExtractorService],
})
export class DocumentsModule {}
