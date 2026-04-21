import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, FileType, DocumentStatus } from '../entities/document.entity';
import { QueryDocumentsDto } from './dto';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
  ) {}

  /**
   * Lưu metadata file đã upload vào database
   */
  async upload(
    userId: string,
    file: Express.Multer.File,
    title?: string,
  ): Promise<Document> {
    // Xác định file type từ extension
    const ext = path.extname(file.originalname).toLowerCase();
    let fileType: FileType;

    if (ext === '.pdf') {
      fileType = FileType.PDF;
    } else if (ext === '.docx') {
      fileType = FileType.DOCX;
    } else {
      throw new BadRequestException(`Unsupported file type: ${ext}. Only .pdf and .docx are allowed.`);
    }

    const document = this.documentRepo.create({
      userId,
      title: title || path.parse(file.originalname).name, // Dùng tên file gốc nếu không có title
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileType,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: DocumentStatus.READY,
    });

    const saved = await this.documentRepo.save(document);
    this.logger.log(`Document uploaded: ${saved.id} by user ${userId}`);

    return saved;
  }

  /**
   * Lấy danh sách tài liệu của user (có phân trang)
   */
  async findAll(userId: string, query: QueryDocumentsDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '10', 10), 50); // Max 50
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.fileType) {
      where.fileType = query.fileType;
    }

    const [data, total] = await this.documentRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết document theo ID (kiểm tra ownership)
   */
  async findOne(userId: string, id: string): Promise<Document> {
    const document = await this.documentRepo.findOne({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return document;
  }
}
