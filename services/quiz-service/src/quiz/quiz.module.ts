import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentAnalysisClient } from './document-analysis.client';

@Module({
  imports: [HttpModule],
  controllers: [QuizController],
  providers: [QuizService, PrismaService, DocumentAnalysisClient],
  exports: [QuizService],
})
export class QuizModule {}
