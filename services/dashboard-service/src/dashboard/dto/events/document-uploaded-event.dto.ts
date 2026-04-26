import { IsUUID } from 'class-validator';
import { BaseEventDto } from './base-event.dto';

export class DocumentUploadedEventDto extends BaseEventDto {
  @IsUUID()
  document_id!: string;
}
