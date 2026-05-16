import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async handleDocumentUploaded(payload: { document_id: string }) {
    const { document_id } = payload;
    this.logger.log(
      `[summary] document.uploaded ${document_id} — processing handled by document-service`,
    );
    await this.syncSummaryFromDocument(document_id);
  }

  async generateSummary(documentId: string, force = false) {
    this.logger.log(`[summary] sync from document ${documentId} (force=${force})`);

    if (force) {
      await this.triggerDocumentReprocess(documentId, true);
    }

    return this.syncSummaryFromDocument(documentId, force);
  }

  async getSummaryByDocumentId(documentId: string) {
    const existing = await this.prisma.summary.findFirst({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    if (existing?.content) {
      return existing;
    }

    return this.syncSummaryFromDocument(documentId);
  }

  private async syncSummaryFromDocument(documentId: string, force = false) {
    const documentServiceUrl =
      this.configService.get<string>('DOCUMENT_SERVICE_URL') ||
      'http://localhost:3003';

    let doc: Record<string, unknown> | null = null;
    try {
      const res = await axios.get(`${documentServiceUrl}/api/documents/${documentId}`, {
        timeout: 15000,
      });
      doc = res.data?.data ?? res.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`[summary] fetch document failed: ${message}`);
    }

    const status = doc?.status as string | undefined;
    if (status === 'PROCESSING' || status === 'UPLOADING') {
      throw new BadRequestException(
        'Tài liệu đang được xử lý. Vui lòng đợi vài giây rồi tải lại trang.',
      );
    }

    let analysis: { summary?: string } | null =
      (doc?.aiAnalysis as { summary?: string }) ?? null;

    if (!analysis?.summary) {
      try {
        const analysisRes = await axios.get(
          `${documentServiceUrl}/api/documents/${documentId}/ai-analysis`,
          { timeout: 15000 },
        );
        analysis = analysisRes.data?.data ?? analysisRes.data;
      } catch {
        analysis = null;
      }
    }

    const content = analysis?.summary?.trim();
    if (!content) {
      if (status === 'FAILED') {
        throw new BadRequestException(
          (doc?.processingError as string) ||
            'Xử lý tài liệu thất bại. Hệ thống vẫn cho phép xem nội dung và dùng chế độ cục bộ.',
        );
      }
      throw new NotFoundException(
        `Chưa có phân tích cho document ${documentId}. Đợi trạng thái READY.`,
      );
    }

    if (force) {
      await this.prisma.summary.deleteMany({ where: { documentId } });
    }

    const existing = await this.prisma.summary.findFirst({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    if (existing && !force) {
      if (existing.content !== content) {
        return this.prisma.summary.update({
          where: { id: existing.id },
          data: { content },
        });
      }
      return existing;
    }

    const summary = await this.prisma.summary.create({
      data: { documentId, content },
    });

    this.logger.log(
      `[summary] synced document ${documentId} source=${doc?.aiSource ?? 'document'}`,
    );
    return summary;
  }

  private async triggerDocumentReprocess(documentId: string, forceAi: boolean) {
    const documentServiceUrl =
      this.configService.get<string>('DOCUMENT_SERVICE_URL') ||
      'http://localhost:3003';
    try {
      await axios.post(
        `${documentServiceUrl}/api/documents/${documentId}/reprocess`,
        { forceAi },
        { timeout: 120000 },
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`[summary] reprocess trigger failed: ${message}`);
    }
  }
}
