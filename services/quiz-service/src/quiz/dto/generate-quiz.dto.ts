import { IsUUID, IsNotEmpty } from 'class-validator';

export class GenerateQuizDto {
  @IsUUID()
  @IsNotEmpty()
  documentId: string;
}
