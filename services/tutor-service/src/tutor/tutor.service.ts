import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
      // 1. Load full document text (+ optional summary)
      const { documentText, summary } = await this.getDocumentContext(documentId);

      if (!documentText?.trim()) {
        throw new BadRequestException(
          'Tài liệu chưa có nội dung văn bản. Hãy tải lại file PDF/DOCX hoặc vào trang Tài liệu → Tạo tóm tắt trước.',
        );
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
      const answer = await this.generateAnswer(
        question,
        documentText,
        summary,
        conversation.messages || [],
      );

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
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process question');
    }
  }

  private async getDocumentContext(documentId: string): Promise<{
    documentText: string;
    summary: string | null;
  }> {
    const documentText = await this.getDocumentText(documentId);
    const summary = await this.getSummaryOptional(documentId);
    return { documentText, summary };
  }

  private async getDocumentText(documentId: string): Promise<string> {
    try {
      const documentServiceUrl = this.configService.get<string>(
        'DOCUMENT_SERVICE_URL',
        'http://localhost:3003',
      );
      const response = await firstValueFrom(
        this.httpService.post(
          `${documentServiceUrl}/api/documents/${documentId}/extract`,
        ),
      );
      const text =
        response.data?.data?.text ??
        response.data?.text ??
        '';
      if (text) {
        this.logger.log(
          `Loaded document text for ${documentId}: ${text.length} chars`,
        );
      }
      return text;
    } catch (error) {
      this.logger.error(
        `Failed to fetch document text for ${documentId}: ${error.message}`,
      );
      return '';
    }
  }

  private async getSummaryOptional(documentId: string): Promise<string | null> {
    try {
      const summaryServiceUrl = this.configService.get<string>(
        'SUMMARY_SERVICE_URL',
        'http://localhost:3006',
      );
      const response = await firstValueFrom(
        this.httpService.get(
          `${summaryServiceUrl}/api/summaries/document/${documentId}`,
        ),
      );
      const summary =
        response.data?.data?.content ||
        response.data?.summary ||
        response.data?.content;
      return summary || null;
    } catch {
      return null;
    }
  }

  private truncateText(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;
    return `${text.slice(0, maxChars)}\n\n[... nội dung bị cắt bớt do giới hạn độ dài ...]`;
  }

  private async generateAnswer(
    question: string,
    documentText: string,
    summary: string | null,
    previousMessages: any[],
  ): Promise<string> {
    if (!this.genAI) {
      throw new InternalServerErrorException('GEMINI_API_KEY is missing. Please add it to your .env file to enable AI tutoring.');
    }

    try {
      const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
      const model = this.genAI.getGenerativeModel({ model: modelName });

      // Build chat history context
      let historyContext = '';
      if (previousMessages && previousMessages.length > 0) {
        historyContext = 'Previous conversation history:\n' + 
          previousMessages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n') + '\n\n';
      }

      const docExcerpt = this.truncateText(documentText, 60000);
      const summaryBlock = summary
        ? `\n=== TÓM TẮT (tham khảo) ===\n"""\n${summary}\n"""\n`
        : '';

      const prompt = `Bạn là Gia sư Tiếng Anh AI. Trả lời DỰA TRÊN NỘI DUNG TÀI LIỆU GỐC bên dưới (có đủ câu hỏi bài tập nếu là file quiz).

=== NỘI DUNG TÀI LIỆU GỐC ===
"""
${docExcerpt}
"""
${summaryBlock}
${historyContext}

=== NĂNG LỰC ===
- Giải đáp câu hỏi trắc nghiệm / bài tập trong tài liệu (ghi rõ đáp án A/B/C/D và giải thích)
- Giải thích ngữ pháp, sửa câu, dịch từ vựng

=== ĐỊNH DẠNG BẮT BUỘC (Markdown, dễ đọc) ===
- Mỗi câu hỏi một block riêng: ### Câu 1, **Đáp án: B**, giải thích 2-3 câu
- Dùng danh sách gạch đầu dòng, KHÔNG viết một đoạn văn dài liên tục
- Tối đa 5-8 dòng giải thích mỗi câu (trừ khi user yêu cầu chi tiết hơn)

=== QUY TẮC ===
1. Ưu tiên trích dẫn đúng nội dung từ tài liệu gốc.
2. Chỉ nói "không có trong tài liệu" khi thật sự không thấy trong phần NỘI DUNG TÀI LIỆU GỐC.
3. Trả lời tiếng Việt; giữ nguyên câu/đáp án tiếng Anh.

=== CÂU HỎI HỌC VIÊN ===
${question}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error(`AI generation failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate answer from AI');
    }
  }



  async getHistory(userId: string, documentId?: string, skip: number = 0, take: number = 10) {
    try {
      // Find conversations for the user (optionally filtered by documentId)
      const conversations = await this.prisma.conversation.findMany({
        where: documentId ? { documentId } : {},
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      });

      // Transform to tutor chat response format
      const history = conversations.map((conv) => ({
        conversationId: conv.id,
        documentId: conv.documentId,
        messages: conv.messages,
      }));

      const total = await this.prisma.conversation.count({
        where: documentId ? { documentId } : {},
      });

      return {
        data: history,
        pagination: {
          skip,
          take,
          total,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching tutor history: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch tutor history');
    }
  }
}
