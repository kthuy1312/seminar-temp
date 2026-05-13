import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GoalQueryDto {
    @ApiPropertyOptional({ description: 'Filter by goal status', enum: ['active', 'completed', 'paused'] })
    @IsOptional()
    @IsIn(['active', 'completed', 'paused'])
    status?: string;

    @ApiPropertyOptional({ description: 'Filter by category' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Items per page', example: 10, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Sort by field', enum: ['created_at', 'updated_at', 'target_date', 'progress'] })
    @IsOptional()
    @IsIn(['created_at', 'updated_at', 'target_date', 'progress'])
    sort_by?: string = 'created_at';

    @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sort_order?: 'asc' | 'desc' = 'desc';
}
