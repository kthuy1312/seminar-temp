import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly configService: ConfigService,
  ) {}

  async handleDocumentUploaded(payload: any) {
    const { document_id, extracted_text } = payload;
    
    this.logger.log(`Received document.uploaded event for document: ${document_id}`);
    
    let textToSummarize = extracted_text;

    // 1 & 2 & 3: Nếu payload không có text (hoặc vì lý do nào đó), ta sẽ gọi Document Service để lấy
    if (!textToSummarize) {
      this.logger.log(`No extracted text in payload, calling Document Service to extract for ${document_id}`);
      try {
        const documentServiceUrl =
          process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3003';
        const response = await axios.post(
          `${documentServiceUrl}/api/documents/${document_id}/extract`,
        );
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

  private extractTextFromResponse(response: { data?: unknown }): string {
    const data = response.data as Record<string, unknown> | undefined;
    const inner = data?.data as Record<string, unknown> | undefined;
    return (
      (inner?.text as string) ||
      (data?.text as string) ||
      ''
    );
  }

  async generateSummary(documentId: string, force = false) {
    this.logger.log(`Generating summary for document ${documentId} (force=${force})...`);

    try {
      if (!force) {
        const existingSummary = await this.prisma.summary.findFirst({
          where: { documentId },
          orderBy: { createdAt: 'desc' },
        });
        if (existingSummary) {
          return existingSummary;
        }
      } else {
        await this.prisma.summary.deleteMany({ where: { documentId } });
      }

      const documentServiceUrl =
        this.configService.get<string>('DOCUMENT_SERVICE_URL') || 'http://localhost:3003';
      const extractResponse = await axios.post(
        `${documentServiceUrl}/api/documents/${documentId}/extract`,
        {},
        { timeout: 30000 },
      );

      const textToSummarize = this.extractTextFromResponse(extractResponse);

      if (!textToSummarize?.trim()) {
        throw new BadRequestException(
          'Không đọc được nội dung file. Hãy tải lại file PDF/DOCX hợp lệ.',
        );
      }

      const summaryContent = await this.aiService.summarizeText(textToSummarize);

      const summary = await this.prisma.summary.create({
        data: { documentId, content: summaryContent },
      });

      this.logger.log(`Successfully generated summary for document ${documentId}`);
      return summary;
    } catch (error) {
      this.logger.error(`Failed to generate summary for document ${documentId}:`, error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (error instanceof BadRequestException) throw error;
      if (message.includes('quota') || message.includes('429')) {
        throw new ServiceUnavailableException(message);
      }
      if (message.includes('GEMINI_API_KEY')) {
        throw new InternalServerErrorException(message);
      }
      throw new InternalServerErrorException(
        `Phân tích thất bại: ${message}`,
      );
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
