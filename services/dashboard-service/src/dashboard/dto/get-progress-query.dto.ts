import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class GetProgressQueryDto {
  @ApiPropertyOptional({ description: 'User id (UUID)' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Aggregation window',
    enum: ['7d', '30d', '90d'],
    default: '30d',
  })
  @IsOptional()
  @IsIn(['7d', '30d', '90d'])
  period: '7d' | '30d' | '90d' = '30d';
}
