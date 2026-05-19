import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DocumentAnalysisClient } from './document-analysis.client';
import { buildAnalysisFromText } from './rule-based-generator';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly documentClient: DocumentAnalysisClient,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateQuiz(documentId: string, userId: string) {
    let quiz = await this.prisma.quiz.findFirst({
      where: { documentId },
      include: { questions: true },
    });

    if (quiz && quiz.questions.length > 0) {
      return quiz;
    }

    await this.generateAndCacheBoth(documentId, userId);

    quiz = await this.prisma.quiz.findFirst({
      where: { documentId },
      include: { questions: true },
    });

    if (!quiz || quiz.questions.length === 0) {
      throw new BadRequestException('Không thể tạo quiz từ tài liệu này.');
    }

    return quiz;
  }

  async generateFlashcards(documentId: string, userId: string) {
    let cards = await this.prisma.flashcard.findMany({
      where: { documentId, userId },
    });

    if (cards.length > 0) {
      return cards;
    }

    await this.generateAndCacheBoth(documentId, userId);

    cards = await this.prisma.flashcard.findMany({
      where: { documentId, userId },
    });

    if (cards.length === 0) {
      throw new BadRequestException('Không thể tạo flashcard từ tài liệu này.');
    }

    return cards;
  }

  private async generateAndCacheBoth(documentId: string, userId: string) {
    this.logger.log(`[one-pass-ai] Bắt đầu xử lý gộp cho document=${documentId}`);
    
    const text = await this.documentClient.fetchDocumentText(documentId);
    if (!text?.trim()) {
      throw new NotFoundException(`Tài liệu ${documentId} chưa sẵn sàng. Đợi trạng thái READY hoặc tải lại file.`);
    }

    let result;

    if (this.genAI) {
      try {
        const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
        const model = this.genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `Bạn là chuyên gia giáo dục. Hãy đọc tài liệu dưới đây và tạo ra:
1. Một bộ Quiz 10 câu hỏi trắc nghiệm (về từ vựng, ngữ pháp, ý chính).
2. Một bộ 12 thẻ Flashcard (mặt trước là khái niệm/từ vựng tiếng Anh, mặt sau là giải nghĩa tiếng Việt).

Tài liệu:
"""
${text.slice(0, 15000)}
"""

CHỈ trả về kết quả dưới định dạng JSON hợp lệ (không chứa ký tự markdown như \`\`\`json), với cấu trúc chính xác như sau:
{
  "questions": [
    { "questionText": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "ghi chính xác nội dung text của đáp án đúng, KHÔNG dùng A B C D", "explanation": "..." }
  ],
  "flashcards": [
    { "front": "...", "back": "..." }
  ]
}
`;

        const response = await model.generateContent(prompt);
        let rawText = response.response.text().trim();
        if (rawText.startsWith('```json')) {
           rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        
        result = JSON.parse(rawText);
        this.logger.log(`[one-pass-ai] Gemini thành công cho document=${documentId}`);
      } catch (err: any) {
        this.logger.error(`[one-pass-ai] Gemini failed: ${err.message}. Fallback to local.`);
        result = buildAnalysisFromText(text);
      }
    } else {
      this.logger.warn(`[one-pass-ai] Không có GEMINI_API_KEY. Dùng local.`);
      result = buildAnalysisFromText(text);
    }

    const questions = result.questions?.slice(0, 10) ?? [];
    if (questions.length > 0) {
      const existingQuiz = await this.prisma.quiz.findFirst({ where: { documentId } });
      if (!existingQuiz) {
        await this.prisma.quiz.create({
          data: {
            documentId,
            title: `Quiz - ${documentId.slice(0, 8)}`,
            questions: {
              create: questions.map((q: any) => {
                let correct = q.correctAnswer;
                if (correct && /^[A-D]$/i.test(correct.trim())) {
                  const idx = correct.trim().toUpperCase().charCodeAt(0) - 65;
                  if (q.options && idx >= 0 && idx < q.options.length) {
                    correct = q.options[idx];
                  }
                }
                return {
                  questionText: q.questionText,
                  options: q.options,
                  correctAnswer: correct,
                  explanation: q.explanation || '',
                };
              }),
            },
          },
        });
      }
    }

    const flashcards = result.flashcards?.slice(0, 12) ?? [];
    if (flashcards.length > 0 && userId) {
      const existingCards = await this.prisma.flashcard.count({ where: { documentId, userId } });
      if (existingCards === 0) {
        await Promise.all(
          flashcards.map((card: any) =>
            this.prisma.flashcard.create({
              data: {
                documentId,
                userId,
                front: card.front,
                back: card.back,
              },
            })
          )
        );
      }
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
            correctAnswer: true,
          },
        },
      },
    });

    if (!quiz) throw new NotFoundException(`Quiz ${id} not found`);
    return quiz;
  }

  async listQuizzes(userId: string, skip: number = 0, take: number = 10) {
    const quizzes = await this.prisma.quiz.findMany({
      skip, take,
      include: { questions: { select: { id: true, questionText: true, options: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const total = await this.prisma.quiz.count();
    return { data: quizzes, pagination: { skip, take, total } };
  }

  async deleteQuiz(id: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    await this.prisma.$transaction([
      this.prisma.quizAttempt.deleteMany({ where: { quizId: id } }),
      this.prisma.question.deleteMany({ where: { quizId: id } }),
      this.prisma.quiz.delete({ where: { id } }),
    ]);

    return { success: true };
  }

  async submitQuiz(quizId: string, userId: string, answers: Record<string, string>) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) throw new NotFoundException(`Quiz ${quizId} not found`);

    let score = 0;
    const total = quiz.questions.length;
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctAnswer) score++;
    }

    const attempt = await this.prisma.quizAttempt.create({
      data: { quizId, userId, score, total, answers },
    });

    this.notifyDashboardOfQuizCompleted(userId, quizId, score, total);
    return attempt;
  }

  async listFlashcards(userId: string, documentId?: string) {
    return this.prisma.flashcard.findMany({
      where: { userId, ...(documentId && { documentId }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteFlashcard(userId: string, id: string) {
    const card = await this.prisma.flashcard.findUnique({ where: { id } });
    if (!card || card.userId !== userId) throw new NotFoundException('Flashcard not found');
    await this.prisma.flashcard.delete({ where: { id } });
    return { success: true };
  }

  private async notifyDashboardOfQuizCompleted(userId: string, quizId: string, score: number, total: number) {
    try {
      const url = this.configService.get<string>('DASHBOARD_SERVICE_URL') || 'http://localhost:3002';
      await firstValueFrom(
        this.httpService.post(`${url}/api/dashboard/events/quiz-completed`, {
          user_id: userId,
          quiz_id: quizId,
          score: Math.round((score / total) * 100),
          total_questions: total,
          occurred_at: new Date().toISOString(),
        })
      );
    } catch (err: any) {
      this.logger.warn(`Dashboard notify failed: ${err.message}`);
    }
  }
}
