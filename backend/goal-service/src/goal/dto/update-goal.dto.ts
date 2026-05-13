import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateGoalDto } from './create-goal.dto';
import { IsIn, IsInt, IsOptional, Max, Min, IsString, Length } from 'class-validator';

export class UpdateGoalDto extends PartialType(CreateGoalDto) {
  @ApiPropertyOptional({
    description: 'Status of the goal',
    enum: ['active', 'completed', 'paused'],
    example: 'active',
  })
  @IsOptional()
  @IsIn(['active', 'completed', 'paused'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Progress percentage (0-100)',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;
}
