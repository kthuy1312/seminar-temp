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
import { FileType } from '@prisma/client';
import { FileTypeEnum, QueryDocumentsDto } from './dto/document.dto';
import { extname } from 'path';
import { TextExtractorService, ExtractResult } from './text-extractor.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  // Các loại file được phép ở tầng service (defence-in-depth)
  private readonly ALLOWED_TYPES: FileTypeEnum[] = [
    FileTypeEnum.PDF,
    FileTypeEnum.DOCX,
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly textExtractor: TextExtractorService,
    @Inject('RABBITMQ_CLIENT') private readonly rabbitClient: ClientProxy,
  ) {}

  // ─── UPLOAD ────────────────────────────────────────────────

  async upload(file: Express.Multer.File, userId?: string) {
    if (!file) {
      throw new BadRequestException('File không được để trống');
    }

    // Lấy extension và validate (2nd layer sau fileFilter)
    const ext = extname(file.originalname).toLowerCase().replace('.', '') as FileTypeEnum;

    if (!this.ALLOWED_TYPES.includes(ext)) {
      throw new BadRequestException(
        `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${this.ALLOWED_TYPES.join(', ')}`,
      );
    }

    // Kiểm tra kích thước (guard phòng khi limits của multer bị bypass)
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      throw new BadRequestException(
        `File quá lớn. Kích thước tối đa cho phép là 10 MB (bạn upload: ${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      );
    }

    // ─── EXTRACT TEXT NGAY LÚC UPLOAD ───
    let extractedText: string | null = null;
    try {
      this.logger.log(`Auto-extracting text for: ${file.originalname}`);
      const extractResult = await this.textExtractor.extract(file.path, file.originalname);
      extractedText = extractResult.text;
    } catch (err: unknown) {
      this.logger.warn(
        `Failed to auto-extract text for ${file.originalname} (file might be scanned/corrupted). Continuing upload.`,
      );
    }

    try {
      const document = await this.prisma.document.create({
        data: {
          userId: userId ?? null,
          fileName: file.originalname,
          fileType: ext as unknown as FileType,
          filePath: file.path,
          fileSize: BigInt(file.size),
          extractedText, // Lưu text vào CSDL
        },
      });

      this.logger.log(
        `Document uploaded: ${document.fileName} (id=${document.id}, size=${file.size}B)`,
      );

      // ─── PUBLISH RABBITMQ EVENT ───
      this.rabbitClient.emit('document.uploaded', {
        document_id: document.id,
        extracted_text: extractedText,
      });
      this.logger.log(`Published event 'document.uploaded' for document: ${document.id}`);

      return this.serializeDocument(document, file.filename);
    } catch (err: unknown) {
      this.logger.error('Failed to save document metadata', err);
      throw new InternalServerErrorException(
        'Không thể lưu thông tin file vào cơ sở dữ liệu',
      );
    }
  }

  // ─── GET ALL ───────────────────────────────────────────────

  async findAll(query: QueryDocumentsDto) {
    const where: Record<string, unknown> = {};

    if (query.userId) {
      where['userId'] = query.userId;
    }

    if (query.fileType) {
      where['fileType'] = query.fileType as unknown as FileType;
    }

    const documents = await this.prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
    });

    return documents.map((doc) => this.serializeDocument(doc));
  }

  // ─── EXTRACT TEXT ──────────────────────────────────────────

  /**
   * Đọc file từ disk và extract plain text.
   * Dùng sau khi upload để index nội dung cho tìm kiếm / AI.
   *
   * @param id  UUID của document trong DB
   * @returns ExtractResult { text, charCount, lineCount, sourceType }
   */
  async extractText(id: string): Promise<ExtractResult> {
    const document = await this.prisma.document.findUnique({ where: { id } });

    if (!document) {
      throw new NotFoundException(`Document với id "${id}" không tồn tại`);
    }

    this.logger.log(`Extracting text for document: ${document.fileName} (id=${id})`);

    const result = await this.textExtractor.extract(document.filePath, document.fileName);

    // Lưu / Cập nhật lại text vào CSDL
    await this.prisma.document.update({
      where: { id },
      data: { extractedText: result.text },
    });

    return result;
  }

  // ─── GET BY ID ─────────────────────────────────────────────

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document với id "${id}" không tồn tại`);
    }

    return this.serializeDocument(document);
  }

  // ─── HELPER ────────────────────────────────────────────────

  /**
   * Chuyển đổi BigInt sang Number và thêm field `url` để download.
   * `storedFilename` là tên file thực tế trên disk (uuid.ext).
   * Nếu không có (khi fetch từ DB), parse từ filePath.
   */
  private serializeDocument(doc: any, storedFilename?: string) {
    const filename = storedFilename ?? doc.filePath?.split(/[\\/]/).pop() ?? '';
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3004';

    return {
      id: doc.id,
      userId: doc.userId,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: Number(doc.fileSize),           // BigInt → Number (safe < 2^53)
      fileSizeFormatted: this.formatBytes(Number(doc.fileSize)),
      url: `${baseUrl}/api/documents/files/${filename}`, // Download URL
      uploadedAt: doc.uploadedAt,
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
}
