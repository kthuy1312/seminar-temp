import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [QuizController],
  providers: [QuizService, PrismaService],
  exports: [QuizService],
})
export class QuizModule {}
