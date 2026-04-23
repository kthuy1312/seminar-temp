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
    const maxRetries = 3;
    const timeoutMs = 15000;
    const prompt = `Bạn là một trợ lý AI học tập xuất sắc. Hãy tóm tắt nội dung tài liệu sau đây thành đúng 5 ý chính. Trình bày bằng tiếng Việt, dưới dạng danh sách gạch đầu dòng:\n\n${text}`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort(new Error('RequestTimeout'));
      }, timeoutMs);

      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        
        const result = await model.generateContent(
          { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
          { signal: controller.signal } as any
        );
        
        clearTimeout(timeoutId);
        
        const response = result.response;
        return response.text();
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        const isTimeout = error.name === 'AbortError' || error.message === 'RequestTimeout';
        if (isTimeout) {
          this.logger.error(`Gemini API timeout after ${timeoutMs}ms on attempt ${attempt}`);
          if (attempt >= maxRetries) {
            throw new Error('Gemini API request timed out');
          }
        } else {
          const is503 = error?.status === 503 || error?.message?.includes('503');
          if (!is503) {
            this.logger.error('Error calling Gemini API', error);
            throw new Error('Failed to summarize text using AI');
          }
          
          this.logger.warn(`Gemini API 503 error. Retrying in attempt ${attempt}...`);
          if (attempt >= maxRetries) {
            this.logger.error('Max retries reached for Gemini API 503 error');
            throw new Error('Failed to summarize text due to 503 Service Unavailable');
          }
        }
        
        // Exponential backoff
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
    
    throw new Error('Failed to summarize text after retries');
  }
}
