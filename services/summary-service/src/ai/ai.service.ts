import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  async summarizeText(text: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `Bạn là một trợ lý AI học tập xuất sắc. Hãy tóm tắt nội dung tài liệu sau đây một cách ngắn gọn, rõ ràng, tập trung vào các ý chính và kết luận quan trọng. Trình bày bằng tiếng Việt:\n\n${text}`;
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Error calling Gemini API', error);
      throw new Error('Failed to summarize text using AI');
    }
  }
}
