import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';

// ─── Chỉ cho phép PDF và DOCX ─────────────────────────────────
export enum FileTypeEnum {
  PDF = 'pdf',
  DOCX = 'docx',
}

export const ALLOWED_MIME_TYPES: Record<FileTypeEnum, string> = {
  [FileTypeEnum.PDF]: 'application/pdf',
  [FileTypeEnum.DOCX]: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── DTOs ─────────────────────────────────────────────────────

export class UploadDocumentDto {
  @IsOptional()
  @IsUUID('4', { message: 'userId phải là UUID hợp lệ' })
  userId?: string; // Thực tế sẽ lấy từ JWT, để optional cho demo
}

export class QueryDocumentsDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(FileTypeEnum, { message: 'fileType phải là: pdf, docx' })
  fileType?: FileTypeEnum;
}
