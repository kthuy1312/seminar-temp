import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentStatus, FileType } from '@prisma/client';
import { QueryDocumentsDto } from './dto/documents.dto';
import { extname } from 'path';
import { TextExtractorService, ExtractResult } from './text-extractor.service';
import { DocumentPipelineService } from '../processing/document-pipeline.service';
import { AiAnalysisPayload } from '../processing/types';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  private readonly ALLOWED_TYPES: FileType[] = [
    FileType.pdf,
    FileType.docx,
    FileType.txt,
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly textExtractor: TextExtractorService,
    private readonly pipeline: DocumentPipelineService,
    @Inject('RABBITMQ_CLIENT') private readonly rabbitClient: ClientProxy,
  ) {}

  async upload(file: Express.Multer.File, userId?: string) {
    if (!file) {
      throw new BadRequestException('File không được để trống');
    }

    const ext = extname(file.originalname).toLowerCase().replace('.', '') as FileType;

    if (!this.ALLOWED_TYPES.includes(ext)) {
      throw new BadRequestException(
        `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${this.ALLOWED_TYPES.join(', ')}`,
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException(
        `File quá lớn. Kích thước tối đa cho phép là 10 MB (bạn upload: ${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      );
    }

    let extractedText: string | null = null;
    try {
      this.logger.log(`Auto-extracting text for: ${file.originalname}`);
      const extractResult = await this.textExtractor.extract(file.path, file.originalname);
      extractedText = extractResult.text;
    } catch {
      this.logger.warn(
        `Failed to auto-extract text for ${file.originalname}. Continuing upload.`,
      );
    }

    try {
      const document = await this.prisma.document.create({
        data: {
          userId: userId ?? null,
          fileName: file.originalname,
          fileType: ext,
          filePath: file.path,
          fileSize: BigInt(file.size),
          rawText: extractedText,
          extractedText,
          status: DocumentStatus.UPLOADING,
        },
      });

      await this.prisma.document.update({
        where: { id: document.id },
        data: { status: DocumentStatus.PROCESSING },
      });

      this.logger.log(
        `Document uploaded: ${document.fileName} (id=${document.id}, size=${file.size}B)`,
      );

      this.rabbitClient.emit('document.uploaded', {
        document_id: document.id,
        extracted_text: extractedText,
      });

      this.pipeline.scheduleProcessing(document.id);

      return this.serializeDocument(
        { ...document, status: DocumentStatus.PROCESSING },
        file.filename,
      );
    } catch (err: unknown) {
      this.logger.error('Failed to save document metadata', err);
      throw new InternalServerErrorException(
        'Không thể lưu thông tin file vào cơ sở dữ liệu',
      );
    }
  }

  async findAll(query: QueryDocumentsDto) {
    const where: Record<string, unknown> = {};
    if (query.userId) where['userId'] = query.userId;
    if (query.fileType) where['fileType'] = query.fileType;

    const documents = await this.prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
    });

    return documents.map((doc) => this.serializeDocument(doc));
  }

  async extractText(id: string): Promise<ExtractResult> {
    const document = await this.prisma.document.findUnique({ where: { id } });

    if (!document) {
      throw new NotFoundException(`Document với id "${id}" không tồn tại`);
    }

    const text =
      document.processedContent ??
      document.extractedText ??
      document.rawText;

    if (text) {
      return {
        text,
        charCount: text.length,
        lineCount: text.split('\n').length,
        sourceType: document.fileName.endsWith('.pdf') ? 'pdf' : 'docx',
      };
    }

    const result = await this.textExtractor.extract(document.filePath, document.fileName);

    await this.prisma.document.update({
      where: { id },
      data: { extractedText: result.text, rawText: result.text },
    });

    return result;
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });

    if (!document) {
      throw new NotFoundException(`Document với id "${id}" không tồn tại`);
    }

    return this.serializeDocument(document);
  }

  async getAiAnalysis(id: string): Promise<AiAnalysisPayload | null> {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document với id "${id}" không tồn tại`);
    }
    return (document.aiAnalysis as unknown as AiAnalysisPayload | null) ?? null;
  }

  async getProcessingStatus(id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document với id "${id}" không tồn tại`);
    }

    return {
      status: document.status,
      documentType: document.documentType,
      aiSource: document.aiSource,
      processingMs: document.processingMs,
      processingError: document.processingError,
      processedAt: document.processedAt,
      hasAiAnalysis: document.aiAnalysis != null,
    };
  }

  async reprocess(id: string, forceAi = false) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document với id "${id}" không tồn tại`);
    }

    await this.pipeline.runPipeline(id, forceAi);
    return this.findOne(id);
  }

  private serializeDocument(doc: Record<string, unknown>, storedFilename?: string) {
    const filePath = doc.filePath as string | undefined;
    const filename = storedFilename ?? filePath?.split(/[\\/]/).pop() ?? '';
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    const aiAnalysis = doc.aiAnalysis as AiAnalysisPayload | null | undefined;

    return {
      id: doc.id,
      userId: doc.userId,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: Number(doc.fileSize),
      fileSizeFormatted: this.formatBytes(Number(doc.fileSize)),
      url: `${baseUrl}/api/documents/files/${filename}`,
      uploadedAt: doc.uploadedAt,
      status: doc.status ?? DocumentStatus.READY,
      documentType: doc.documentType ?? null,
      aiSource: doc.aiSource ?? null,
      processingError: doc.processingError ?? null,
      processedAt: doc.processedAt ?? null,
      hasAiAnalysis: aiAnalysis != null,
      previewText: this.previewText(doc),
      aiAnalysis: aiAnalysis ?? null,
    };
  }

  private previewText(doc: Record<string, unknown>): string | null {
    const content =
      (doc.processedContent as string) ??
      (doc.extractedText as string) ??
      (doc.rawText as string);
    if (!content) return null;
    return content.length > 2000 ? `${content.slice(0, 2000)}…` : content;
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
}
