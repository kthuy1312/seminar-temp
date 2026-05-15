import { Controller, Post, Get, Body, Param, Query, Headers, Delete } from '@nestjs/common';
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

  // --- Flashcard Endpoints ---

  @Get('flashcards/all')
  listFlashcards(@Headers('x-user-id') userId: string, @Query('documentId') documentId?: string) {
    return this.quizService.listFlashcards(userId, documentId);
  }

  @Post('flashcards/generate')
  generateFlashcards(@Headers('x-user-id') userId: string, @Body('documentId') documentId: string) {
    return this.quizService.generateFlashcards(documentId, userId);
  }

  @Delete('flashcards/:id')
  deleteFlashcard(@Headers('x-user-id') userId: string, @Param('id') id: string) {
    return this.quizService.deleteFlashcard(userId, id);
  }
}
