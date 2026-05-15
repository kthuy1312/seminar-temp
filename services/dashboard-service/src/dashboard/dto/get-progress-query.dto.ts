import { IsOptional, IsUUID, IsEnum } from 'class-validator';

export class GetProgressQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(['7d', '30d', '90d'])
  period: string = '30d';
}
