import { Controller, Get, Param } from '@nestjs/common';
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
    const summary = await this.summaryService.getSummaryByDocumentId(documentId);
    return {
      success: true,
      data: summary,
    };
  }
}
