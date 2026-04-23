import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('generate')
  generateQuiz(@Body() dto: GenerateQuizDto) {
    return this.quizService.generateQuiz(dto.documentId);
  }

  @Get(':id')
  getQuiz(@Param('id') id: string) {
    return this.quizService.getQuiz(id);
  }

  @Post('submit')
  submitQuiz(@Body() dto: SubmitQuizDto) {
    return this.quizService.submitQuiz(dto.quizId, dto.userId, dto.answers);
  }
}
