import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import axios from 'axios';

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async handleDocumentUploaded(payload: any) {
    const { document_id, extracted_text } = payload;
    
    this.logger.log(`Received document.uploaded event for document: ${document_id}`);
    
    let textToSummarize = extracted_text;

    // 1 & 2 & 3: Nếu payload không có text (hoặc vì lý do nào đó), ta sẽ gọi Document Service để lấy
    if (!textToSummarize) {
      this.logger.log(`No extracted text in payload, calling Document Service to extract for ${document_id}`);
      try {
        const response = await axios.post(`http://localhost:3004/api/documents/${document_id}/extract`);
        if (response.data?.data?.text) {
          textToSummarize = response.data.data.text;
        } else {
          throw new Error('No text returned from Document Service');
        }
      } catch (error) {
        this.logger.error(`Failed to fetch text from Document Service for ${document_id}`, error);
        return; // Dừng xử lý nếu không lấy được text
      }
    }

    if (!textToSummarize || textToSummarize.trim() === '') {
      this.logger.warn(`Document ${document_id} has empty text. Cannot summarize.`);
      return;
    }

    // 4. Gọi AI (Gemini) để tóm tắt
    this.logger.log(`Calling Gemini AI to summarize document ${document_id}...`);
    let summaryContent = '';
    try {
      summaryContent = await this.aiService.summarizeText(textToSummarize);
    } catch (error) {
      this.logger.error(`Gemini AI failed for document ${document_id}`, error);
      return;
    }

    // 5. Lưu summary vào database
    try {
      const summary = await this.prisma.summary.create({
        data: {
          documentId: document_id,
          content: summaryContent,
        },
      });
      this.logger.log(`Successfully saved summary (id: ${summary.id}) for document ${document_id}`);
    } catch (error) {
      this.logger.error(`Failed to save summary to DB for document ${document_id}`, error);
    }
  }

  async getSummaryByDocumentId(documentId: string) {
    const summary = await this.prisma.summary.findFirst({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    if (!summary) {
      throw new NotFoundException(`Summary cho document ${documentId} không tồn tại`);
    }

    return summary;
  }
}
