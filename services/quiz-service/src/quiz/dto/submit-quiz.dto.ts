import { IsObject, IsNotEmpty, IsUUID } from 'class-validator';

export class SubmitQuizDto {
  @IsUUID()
  @IsNotEmpty()
  quizId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsObject()
  @IsNotEmpty()
  answers: Record<string, string>;
}
