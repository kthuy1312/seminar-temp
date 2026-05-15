import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SummaryService } from './summary.service';

@Controller('api/summaries')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @EventPattern('document.uploaded')
  async handleDocumentUploadedEvent(@Payload() data: any) {
    // Xử lý event ở chế độ nền
    await this.summaryService.handleDocumentUploaded(data);
  }

  @Get('document/:id')
  async getSummaryByDocumentId(@Param('id') documentId: string) {
    return this.summaryService.getSummaryByDocumentId(documentId);
  }

  @Post('generate')
  async generateSummary(@Body() body: { documentId: string; force?: boolean }) {
    return this.summaryService.generateSummary(body.documentId, body.force === true);
  }
}
