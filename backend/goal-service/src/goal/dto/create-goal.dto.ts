import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString, Length } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({
    description: 'The title of the learning goal',
    example: 'Master NestJS',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 255, { message: 'Title must be between 3 and 255 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the goal',
    example: 'Complete advanced NestJS course and build 3 real projects',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Category of the goal',
    example: 'Backend',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Category must be between 1 and 50 characters' })
  category?: string;

  @ApiPropertyOptional({
    description: 'Target date to achieve the goal (ISO 8601 format: YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Target date must be in ISO 8601 format (YYYY-MM-DD)' })
  target_date?: string;
}
