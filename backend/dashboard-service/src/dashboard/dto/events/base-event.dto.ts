import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class BaseEventDto {
  @IsUUID()
  user_id!: string;

  @IsOptional()
  @IsDateString()
  occurred_at?: string;
}
