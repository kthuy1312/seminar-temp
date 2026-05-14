import { Controller, Post, Get, Body, Param, Query, Headers } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('api/quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  listQuizzes(@Headers('x-user-id') userId: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.quizService.listQuizzes(userId, parseInt(skip || '0'), parseInt(take || '10'));
  }

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
