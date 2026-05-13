import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class SubmitQuizDto {
  @IsString()
  @IsNotEmpty()
  quizId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsObject()
  answers: Record<string, string>;
}
