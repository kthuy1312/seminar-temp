import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

@Injectable()
export class QuizService {
  private genAI: GoogleGenerativeAI;
  
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || 'dummy-key';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateQuiz(documentId: string) {
    // 1. Fetch summary from Summary Service
    let summaryText = '';
    try {
      const summaryServiceUrl = this.configService.get<string>('SUMMARY_SERVICE_URL') || 'http://localhost:3002';
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
    let questions = [];
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const prompt = `
        Based on the following summary, generate 5 multiple-choice questions.
        Provide the result as a JSON array where each object has:
        - questionText: string
        - options: string[] (array of 4 options)
        - correctAnswer: string (the exact text of the correct option)
        - explanation: string (why the answer is correct)

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
          title: `Quiz for Document ${documentId}`,
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

      return attempt;
    } catch (error) {
      console.error('Error saving quiz attempt:', error.message);
      throw new InternalServerErrorException('Failed to save quiz attempt');
    }
  }
}
