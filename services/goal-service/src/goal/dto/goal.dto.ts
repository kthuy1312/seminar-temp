import { IsString, IsOptional, IsDateString, IsIn, IsInt, Min, Max } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  target_date?: string;

  @IsOptional()
  @IsString()
  target_score?: string;

  @IsOptional()
  @IsString()
  current_level?: string;

  @IsOptional()
  daily_hours?: number;

  @IsOptional()
  subjects?: string[];
}

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  target_date?: string;

  @IsOptional()
  @IsIn(['active', 'completed', 'paused'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;
}

export class CreateMilestoneDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;
}
