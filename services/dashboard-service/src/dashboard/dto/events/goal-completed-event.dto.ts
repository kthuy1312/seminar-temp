import { IsUUID } from 'class-validator';
import { BaseEventDto } from './base-event.dto';

export class GoalCompletedEventDto extends BaseEventDto {
  @IsUUID()
  goal_id!: string;
}
