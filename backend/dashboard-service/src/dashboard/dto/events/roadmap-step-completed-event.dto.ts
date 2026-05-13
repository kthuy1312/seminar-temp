import { IsUUID } from 'class-validator';
import { BaseEventDto } from './base-event.dto';

export class RoadmapStepCompletedEventDto extends BaseEventDto {
  @IsUUID()
  roadmap_id!: string;

  @IsUUID()
  step_id!: string;
}
