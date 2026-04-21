import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileType } from '@prisma/client';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── UPLOAD ────────────────────────────────────────────────

  async upload(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new BadRequestException('File không được để trống');
    }

    // Lấy extension và validate
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const allowedTypes = ['pdf', 'docx', 'txt', 'pptx', 'xlsx'];

    if (!ext || !allowedTypes.includes(ext)) {
      throw new BadRequestException(
        `Định dạng file không hỗ trợ. Chỉ chấp nhận: ${allowedTypes.join(', ')}`,
      );
    }

    // Lưu thông tin vào DB
    const document = await this.prisma.document.create({
      data: {
        userId,
        fileName: file.originalname,
        fileType: ext as FileType,
        filePath: file.path,         // Đường dẫn file trên server
        fileSize: BigInt(file.size),
      },
    });

    this.logger.log(`Document uploaded: ${document.fileName} (${document.id})`);

    return this.serializeDocument(document);
  }

  // ─── GET ALL ───────────────────────────────────────────────

  async findAll(query: { userId?: string; fileType?: string }) {
    const where: any = {};

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.fileType) {
      where.fileType = query.fileType as FileType;
    }

    const documents = await this.prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
    });

    return documents.map((doc) => this.serializeDocument(doc));
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
   * Prisma trả BigInt cho fileSize, cần convert sang number/string
   * để JSON.stringify không lỗi
   */
  private serializeDocument(doc: any) {
    return {
      ...doc,
      fileSize: Number(doc.fileSize),
    };
  }
}
