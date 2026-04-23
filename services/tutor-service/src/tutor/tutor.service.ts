import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AskDto } from './dto/ask.dto';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TutorService {
  private readonly logger = new Logger(TutorService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async askQuestion(askDto: AskDto) {
    const { question, documentId, conversationId } = askDto;

    try {
      // 1. Fetch Summary from Summary Service
      const summary = await this.getSummaryFromService(documentId);
      
      if (!summary) {
        throw new NotFoundException(`Summary for document ${documentId} not found`);
      }

      // 2. Prepare Context and Prompt
      let conversation;
      if (conversationId) {
        conversation = await this.prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { messages: true },
        });
        if (!conversation) {
          throw new NotFoundException(`Conversation ${conversationId} not found`);
        }
      } else {
        conversation = await this.prisma.conversation.create({
          data: { documentId },
          include: { messages: true },
        });
      }

      // 3. Save User Message
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: question,
        },
      });

      // 4. Generate AI Answer
      const answer = await this.generateAnswer(question, summary, conversation.messages || []);

      // 5. Save AI Answer
      const aiMessage = await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'ai',
          content: answer,
        },
      });

      return {
        conversationId: conversation.id,
        answer: aiMessage.content,
      };

    } catch (error) {
      this.logger.error(`Error processing ask request: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process question');
    }
  }

  private async getSummaryFromService(documentId: string): Promise<string | null> {
    try {
      const summaryServiceUrl = this.configService.get<string>('SUMMARY_SERVICE_URL', 'http://localhost:3002');
      const response = await firstValueFrom(
        this.httpService.get(`${summaryServiceUrl}/summaries/${documentId}`)
      );
      // Assuming the response structure contains the text summary
      return response.data?.summary || response.data?.content || JSON.stringify(response.data);
    } catch (error) {
      this.logger.error(`Failed to fetch summary from Summary Service: ${error.message}`);
      return null;
    }
  }

  private async generateAnswer(question: string, summary: string, previousMessages: any[]): Promise<string> {
    if (!this.genAI) {
      throw new InternalServerErrorException('AI Service is not configured properly');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Build chat history context
      let historyContext = '';
      if (previousMessages && previousMessages.length > 0) {
        historyContext = 'Previous conversation history:\n' + 
          previousMessages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n') + '\n\n';
      }

      const prompt = `You are a helpful AI Study Assistant.
You have the following summary of a document:
"""
${summary}
"""

${historyContext}
Based on the provided summary and conversation history, please answer the user's question clearly and concisely.
If the answer is not in the summary, try your best to answer based on general knowledge but mention that it is not explicitly stated in the document summary.

User Question: ${question}
Answer:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error(`AI generation failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate answer from AI');
    }
  }
}
