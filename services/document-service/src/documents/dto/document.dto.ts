import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum FileTypeEnum {
  PDF = 'pdf',
  DOCX = 'docx',
  TXT = 'txt',
  PPTX = 'pptx',
  XLSX = 'xlsx',
}

export class UploadDocumentDto {
  @IsString()
  @IsOptional()
  userId?: string; // Thực tế sẽ lấy từ JWT, để optional cho demo
}

export class QueryDocumentsDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(FileTypeEnum, { message: 'fileType phải là: pdf, docx, txt, pptx, xlsx' })
  fileType?: FileTypeEnum;
}
