import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AskDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  documentId: string;

  @IsString()
  @IsOptional()
  conversationId?: string;
}
