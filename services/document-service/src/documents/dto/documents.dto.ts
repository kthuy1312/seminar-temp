import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';

export enum FileTypeEnum {
  PDF = 'pdf',
  DOCX = 'docx',
  TXT = 'txt',
}

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export class UploadDocumentDto {
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class QueryDocumentsDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(FileTypeEnum)
  fileType?: FileTypeEnum;
}
