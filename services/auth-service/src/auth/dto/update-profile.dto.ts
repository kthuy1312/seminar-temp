import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Họ tên không được quá 100 ký tự' })
  fullName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
