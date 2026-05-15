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
    if (!this.configService.get<string>('GEMINI_API_KEY')) {
      throw new Error('GEMINI_API_KEY is missing in environment variables. Please add it to your .env file to enable AI summarization.');
    }

    const maxRetries = 3;
    const timeoutMs = 60000;
    const modelName =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
    const inputText =
      text.length > 30000 ? `${text.slice(0, 30000)}\n\n[...đã cắt bớt...]` : text;
    const prompt = `Bạn là trợ lý học Tiếng Anh. Tóm tắt tài liệu sau bằng tiếng Việt, theo cấu trúc Markdown:

## Câu hỏi / Bài tập trong tài liệu
- Liệt kê ĐẦY ĐỦ từng câu hỏi (giữ nguyên tiếng Anh) và các đáp án A/B/C/D nếu có
- Nếu là bài quiz/grammar test, không bỏ sót câu nào

## Từ vựng chính
- 5-10 từ/cụm quan trọng + nghĩa tiếng Việt

## Ngữ pháp quan trọng
- Các điểm ngữ pháp xuất hiện trong bài

## Gợi ý cách học
- 3-4 bước học hiệu quả

Nội dung tài liệu gốc:
${inputText}`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort(new Error('RequestTimeout'));
      }, timeoutMs);

      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        
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
          const is429 = error?.status === 429 || error?.message?.includes('429');
          if (is429) {
            throw new Error(
              'Đã vượt hạn mức Gemini API (quota). Vui lòng đợi 1 phút hoặc đổi API key trong .env.',
            );
          }
          const is503 = error?.status === 503 || error?.message?.includes('503');
          if (!is503) {
            this.logger.error('Error calling Gemini API', error);
            throw new Error(
              error?.message || 'Không thể gọi Gemini API. Kiểm tra GEMINI_API_KEY trong .env.',
            );
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
