import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString, Length } from 'class-validator';

export class CreateMilestoneDto {
  @ApiProperty({
    description: 'The title of the milestone',
    example: 'Finish NestJS crash course',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 255, { message: 'Milestone title must be between 3 and 255 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'Due date for the milestone (ISO 8601 format: YYYY-MM-DD)',
    example: '2026-06-30',
  })
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Due date must be in ISO 8601 format (YYYY-MM-DD)' })
  due_date?: string;
}
