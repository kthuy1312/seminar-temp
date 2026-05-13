import { IsUUID } from 'class-validator';
import { BaseEventDto } from './base-event.dto';

export class GoalCreatedEventDto extends BaseEventDto {
  @IsUUID()
  goal_id!: string;
}
