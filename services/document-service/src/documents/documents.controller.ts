import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Headers,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto, QueryDocumentsDto } from './dto';

@Controller()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * POST /api/documents/upload
   * Upload file PDF hoặc DOCX
   * userId lấy từ header X-User-Id (do API Gateway forward)
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Headers('x-user-id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing X-User-Id header');
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.documentsService.upload(userId, file, dto.title);
  }

  /**
   * GET /api/documents
   * Danh sách tài liệu của user (phân trang)
   */
  @Get()
  async findAll(
    @Headers('x-user-id') userId: string,
    @Query() query: QueryDocumentsDto,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing X-User-Id header');
    }

    return this.documentsService.findAll(userId, query);
  }

  /**
   * GET /api/documents/:id
   * Chi tiết tài liệu theo ID
   */
  @Get(':id')
  async findOne(
    @Headers('x-user-id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing X-User-Id header');
    }

    return this.documentsService.findOne(userId, id);
  }
}
