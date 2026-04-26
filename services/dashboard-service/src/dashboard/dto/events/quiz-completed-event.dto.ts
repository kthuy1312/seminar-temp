import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { BaseEventDto } from './base-event.dto';

export class QuizCompletedEventDto extends BaseEventDto {
  @IsUUID()
  quiz_id!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  score!: number;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
