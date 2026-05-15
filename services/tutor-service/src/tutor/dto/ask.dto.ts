import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AskDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsUUID()
  @IsNotEmpty()
  documentId: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
