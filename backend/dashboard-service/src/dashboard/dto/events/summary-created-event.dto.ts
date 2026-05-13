import { IsUUID } from 'class-validator';
import { BaseEventDto } from './base-event.dto';

export class SummaryCreatedEventDto extends BaseEventDto {
  @IsUUID()
  summary_id!: string;

  @IsUUID()
  document_id!: string;
}
