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
      const summary = response.data?.summary || response.data?.content;
      return summary ? summary : null;
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

      const prompt = `Bạn là một trợ lý AI học tập (AI Tutor) tận tâm và thông minh. Nhiệm vụ của bạn là giải đáp câu hỏi của học sinh dựa trên nội dung tóm tắt được cung cấp.

=== THÔNG TIN ĐẦU VÀO ===
- Tóm tắt tài liệu:
"""
${summary}
"""
${historyContext}

=== YÊU CẦU TRẢ LỜI ===
1. CHÍNH XÁC & NGẮN GỌN: Chỉ trả lời thẳng vào trọng tâm câu hỏi, không lan man.
2. DỄ HIỂU: Sử dụng ngôn từ đơn giản, thân thiện với người học.
3. CÓ VÍ DỤ: Luôn đi kèm 1-2 ví dụ thực tế hoặc minh hoạ cụ thể (nếu có thể) để làm rõ ý.
4. RÕ RÀNG: Trình bày sử dụng gạch đầu dòng hoặc đoạn văn ngắn.
5. TRUNG THỰC: Nếu câu trả lời KHÔNG nằm trong nội dung tóm tắt, hãy ghi rõ: "Nội dung này không được đề cập trong tài liệu hiện tại, nhưng theo tôi hiểu thì..."

=== CÂU HỎI HIỆN TẠI ===
Câu hỏi: ${question}

Hãy đưa ra câu trả lời:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error(`AI generation failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate answer from AI');
    }
  }
}
