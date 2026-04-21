import { IsOptional, IsEnum, IsNumberString } from 'class-validator';
import { FileType } from '../../entities/document.entity';

export class QueryDocumentsDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;
}
