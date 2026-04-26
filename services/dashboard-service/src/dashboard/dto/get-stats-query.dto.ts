import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class GetStatsQueryDto {
  @ApiPropertyOptional({ description: 'User id (UUID)' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
