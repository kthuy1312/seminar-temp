import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Body,
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { DocumentsService } from './documents.service';
import { QueryDocumentsDto, UploadDocumentDto } from './dto/document.dto';
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from './dto/document.dto';

// ─── Multer — Disk Storage ────────────────────────────────────

const storage = diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname).toLowerCase()}`;
    cb(null, uniqueName);
  },
});

/**
 * fileFilter: chỉ chấp nhận .pdf và .docx
 * Kiểm tra cả extension lẫn MIME type để tránh spoofing.
 */
const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Một số client gửi MIME này cho .docx
  'application/msword',
]);

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const ext = extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMES.has(file.mimetype)) {
    return cb(
      new UnsupportedMediaTypeException(
        `Chỉ chấp nhận file PDF hoặc DOCX. Bạn upload: "${file.originalname}"`,
      ),
      false,
    );
  }

  cb(null, true);
};

// ─── Controller ───────────────────────────────────────────────

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * POST /api/documents/upload
   *
   * Body (multipart/form-data):
   *   file   — required  — PDF hoặc DOCX, tối đa 10 MB
   *   userId — optional  — UUID của người dùng
   *
   * Response:
   *   { success: true, data: { id, fileName, fileType, fileSize, url, uploadedAt } }
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: {
        fileSize: MAX_FILE_SIZE_BYTES, // 10 MB
        files: 1,                      // chỉ 1 file mỗi request
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadDocumentDto,
  ) {
    // Multer không throw khi fileFilter reject — nó chỉ bỏ qua file.
    // Nếu fileFilter reject, file sẽ là undefined.
    if (!file) {
      throw new BadRequestException(
        'File không được để trống hoặc định dạng không được hỗ trợ (chỉ chấp nhận PDF, DOCX).',
      );
    }

    return this.documentsService.upload(file, body.userId);
  }

  /**
   * POST /api/documents/:id/extract
   *
   * Đọc file đã upload từ disk và trả về plain text.
   * Dùng để index nội dung hoặc xử lý tiếp bằng AI.
   *
   * Response:
   *   { text, charCount, lineCount, sourceType }
   */
  @Post(':id/extract')
  @HttpCode(HttpStatus.OK)
  async extractText(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.extractText(id);
  }

  /**
   * GET /api/documents
   *
   * Query params:
   *   userId   — optional — UUID
   *   fileType — optional — "pdf" | "docx"
   */
  @Get()
  async findAll(@Query() query: QueryDocumentsDto) {
    return this.documentsService.findAll(query);
  }

  /**
   * GET /api/documents/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.findOne(id);
  }
}

