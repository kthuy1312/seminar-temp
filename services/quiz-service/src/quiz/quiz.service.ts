import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  private genAI: GoogleGenerativeAI;
  
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateQuiz(documentId: string) {
    // 1. Fetch summary from Summary Service
    let summaryText = '';
    try {
      const summaryServiceUrl =
        this.configService.get<string>('SUMMARY_SERVICE_URL') ||
        'http://localhost:3006';
      const response = await axios.get(`${summaryServiceUrl}/api/summaries/document/${documentId}`);
      
      if (response.data && response.data.success && response.data.data && response.data.data.content) {
        summaryText = response.data.data.content;
      } else {
        throw new Error('Summary content not found in response');
      }
    } catch (error) {
      console.error('Error fetching summary:', error.message);
      throw new NotFoundException(`Summary for document ${documentId} not found`);
    }

    // 2. Call AI to generate questions
    if (!this.genAI) {
      throw new InternalServerErrorException('GEMINI_API_KEY is missing. Please add it to your .env file to enable quiz generation.');
    }

    let questions = [];
    try {
      const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const prompt = `
        Based on this English learning material summary, generate 5 multiple-choice questions.
        Focus on: vocabulary, grammar, reading comprehension, or TOEIC/IELTS-style items.
        Mix question types across the set. Questions in English; explanations in Vietnamese.

        Each object:
        - questionText: string (English)
        - options: string[] (4 options in English)
        - correctAnswer: string (exact match to one option)
        - explanation: string (Vietnamese, why correct)

        Summary:
        ${summaryText}

        Return ONLY the JSON array.
      `;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.replace(/```json\n|\n```|```/g, '').trim();
      questions = JSON.parse(jsonStr);
    } catch (error) {
      console.error('AI generation failed:', error.message);
      throw new InternalServerErrorException('Failed to generate quiz questions');
    }

    // 3. Save quiz
    try {
      const quiz = await this.prisma.quiz.create({
        data: {
          documentId,
          title: `English Quiz - ${documentId.slice(0, 8)}`,
          questions: {
            create: questions.map((q: any) => ({
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            })),
          },
        },
        include: {
          questions: true,
        },
      });
      return quiz;
    } catch (error) {
      console.error('Error saving quiz:', error.message);
      throw new InternalServerErrorException('Failed to save quiz to database');
    }
  }

  async getQuiz(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            options: true,
            // we might want to hide correctAnswer in production, but let's keep it for now
          }
        }
      }
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz ${id} not found`);
    }

    return quiz;
  }

  async listQuizzes(userId: string, skip: number = 0, take: number = 10) {
    try {
      const quizzes = await this.prisma.quiz.findMany({
        skip,
        take,
        include: {
          questions: {
            select: {
              id: true,
              questionText: true,
              options: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = await this.prisma.quiz.count();

      return {
        data: quizzes,
        pagination: {
          skip,
          take,
          total,
        },
      };
    } catch (error) {
      console.error('Error listing quizzes:', error.message);
      throw new InternalServerErrorException('Failed to list quizzes');
    }
  }

  async submitQuiz(quizId: string, userId: string, answers: Record<string, string>) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz ${quizId} not found`);
    }

    let score = 0;
    const total = quiz.questions.length;

    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    }

    try {
      const attempt = await this.prisma.quizAttempt.create({
        data: {
          quizId,
          userId,
          score,
          total,
          answers,
        },
      });

      // Notify Dashboard
      this.notifyDashboardOfQuizCompleted(userId, quizId, score, total);

      return attempt;
    } catch (error) {
      console.error('Error saving quiz attempt:', error.message);
      throw new InternalServerErrorException('Failed to save quiz attempt');
    }
  }

  async generateFlashcards(documentId: string, userId: string) {
    // 1. Fetch summary from Summary Service
    let summaryText = '';
    try {
      const summaryServiceUrl =
        this.configService.get<string>('SUMMARY_SERVICE_URL') ||
        'http://localhost:3006';
      const response = await axios.get(`${summaryServiceUrl}/api/summaries/document/${documentId}`);
      
      summaryText = 
        response.data?.data?.content || 
        response.data?.summary || 
        response.data?.content || 
        '';
      
      if (!summaryText) {
        throw new Error('Summary content not found');
      }
    } catch (error) {
      console.error('Error fetching summary for flashcards:', error.message);
      throw new NotFoundException(`Summary for document ${documentId} not found`);
    }

    // 2. Call AI to generate flashcards
    if (!this.genAI) {
      throw new InternalServerErrorException('GEMINI_API_KEY is missing.');
    }

    try {
      const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const prompt = `
        Từ tóm tắt tài liệu học tiếng Anh sau, tạo 6-8 flashcards từ vựng/ngữ pháp.

        Mỗi flashcard:
        - front: từ/cụm tiếng Anh (word or phrase)
        - back: định dạng nhiều dòng tiếng Việt:
          Nghĩa: [nghĩa tiếng Việt]
          Ví dụ: [câu ví dụ tiếng Anh]
          Phát âm/Ghi chú: [IPA hoặc ghi chú ngắn nếu có, hoặc "—"]

        Tóm tắt:
        ${summaryText}

        Trả về DUY NHẤT JSON array [{"front":"...","back":"..."}], không Markdown.
      `;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.replace(/```json\n|\n```|```/g, '').trim();
      const cards = JSON.parse(jsonStr);

      // 3. Save flashcards to database
      const savedCards = await Promise.all(
        cards.map((card: any) =>
          this.prisma.flashcard.create({
            data: {
              documentId,
              userId,
              front: card.front,
              back: card.back,
            },
          }),
        ),
      );

      return savedCards;
    } catch (error) {
      console.error('Flashcard generation failed:', error.message);
      throw new InternalServerErrorException('Failed to generate flashcards using AI');
    }
  }

  async listFlashcards(userId: string, documentId?: string) {
    try {
      return await this.prisma.flashcard.findMany({
        where: {
          userId,
          ...(documentId && { documentId }),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Error listing flashcards:', error.message);
      throw new InternalServerErrorException('Failed to fetch flashcards');
    }
  }

  async deleteFlashcard(userId: string, id: string) {
    const card = await this.prisma.flashcard.findUnique({ where: { id } });
    if (!card || card.userId !== userId) {
      throw new NotFoundException('Flashcard not found');
    }
    await this.prisma.flashcard.delete({ where: { id } });
    return { success: true };
  }

  private async notifyDashboardOfQuizCompleted(userId: string, quizId: string, score: number, total: number) {
    try {
      const dashboardServiceUrl = this.configService.get<string>('DASHBOARD_SERVICE_URL') || 'http://localhost:3002';
      await firstValueFrom(
        this.httpService.post(`${dashboardServiceUrl}/api/dashboard/events/quiz-completed`, {
          user_id: userId,
          quiz_id: quizId,
          score: Math.round((score / total) * 100),
          occurred_at: new Date().toISOString(),
        }),
      );
      this.logger.log(`Notified Dashboard of quiz completion for user ${userId}`);
    } catch (err) {
      console.error(`Failed to notify Dashboard of quiz completion: ${err.message}`);
    }
  }
}
