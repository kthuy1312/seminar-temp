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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DocumentsService } from './documents.service';
import { QueryDocumentsDto } from './dto/document.dto';

// ─── Multer Config ───────────────────────────────────────────

const storage = diskStorage({
  destination: join(process.cwd(), 'uploads'), // Thư mục lưu file
  filename: (_req, file, cb) => {
    // Đặt tên file: uuid + extension gốc (tránh trùng)
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  const allowed = ['.pdf', '.docx', '.txt', '.pptx', '.xlsx'];
  const ext = extname(file.originalname).toLowerCase();

  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File ${ext} không được hỗ trợ`), false);
  }
};

// ─── Controller ──────────────────────────────────────────────

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * POST /api/documents/upload
   * Upload file tài liệu (form-data)
   *
   * Form fields:
   *   - file: binary file
   *   - userId: string (UUID)
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    return this.documentsService.upload(file, userId);
  }

  /**
   * GET /api/documents
   * Lấy danh sách documents (có filter)
   *
   * Query params:
   *   - userId (optional)
   *   - fileType (optional): pdf | docx | txt | pptx | xlsx
   */
  @Get()
  async findAll(@Query() query: QueryDocumentsDto) {
    return this.documentsService.findAll(query);
  }

  /**
   * GET /api/documents/:id
   * Lấy chi tiết 1 document theo ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.findOne(id);
  }
}
