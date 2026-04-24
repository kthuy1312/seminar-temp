import { InternalServerErrorException, Logger } from '@nestjs/common';

export interface AIQuestion {
  id: number;
  question: string;
  options: Record<string, string>;
  answer: string;
}

export interface AIQuizResponse {
  quiz_title: string;
  questions: AIQuestion[];
}

export class AIResponseParser {
  private static readonly logger = new Logger(AIResponseParser.name);

  /**
   * Hàm xử lý và parse response từ AI sang object JSON
   * @param aiRawText Chuỗi string trả về từ Gemini
   * @returns AIQuizResponse Object đã được parse và validate cơ bản
   */
  public static parseQuizResponse(aiRawText: string): AIQuizResponse {
    try {
      // 1. Tiền xử lý (Sanitize): Xóa bỏ các block markdown code nếu AI lỡ sinh ra
      let cleanText = aiRawText.trim();
      
      // Xóa tag mở markdown (vd: ```json)
      cleanText = cleanText.replace(/^```(json)?/i, '').trim();
      // Xóa tag đóng markdown (vd: ```)
      cleanText = cleanText.replace(/```$/i, '').trim();

      // Lấy từ dấu { đầu tiên đến dấu } cuối cùng đề phòng rác ở đầu/cuối
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("Không tìm thấy cấu trúc JSON hợp lệ (thiếu dấu ngoặc {}).");
      }
      
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);

      // 2. Parse JSON
      const parsedData = JSON.parse(cleanText);

      // 3. Validate cấu trúc cơ bản
      this.validateStructure(parsedData);

      return parsedData as AIQuizResponse;

    } catch (error) {
      // 4. Xử lý lỗi
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Lỗi khi parse response từ AI: ${errorMessage}`);
      this.logger.debug(`Raw Text bị lỗi: ${aiRawText}`);
      
      // Ném lỗi 500 ra ngoài (hoặc có thể ném custom exception để service bắt và retry)
      throw new InternalServerErrorException(
        'Hệ thống AI trả về định dạng dữ liệu không hợp lệ. Vui lòng thử lại.'
      );
    }
  }

  /**
   * Hàm kiểm tra sơ bộ xem JSON parse ra có đúng format Quiz không
   */
  private static validateStructure(data: any): void {
    if (!data.quiz_title) {
      throw new Error("Thiếu trường 'quiz_title'");
    }
    
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Thiếu trường 'questions' hoặc 'questions' không phải là mảng");
    }

    if (data.questions.length === 0) {
      throw new Error("Mảng 'questions' đang bị rỗng");
    }

    const firstQ = data.questions[0];
    if (!firstQ.question || !firstQ.options || !firstQ.answer) {
      throw new Error("Cấu trúc của câu hỏi (question) bên trong không đúng định dạng (thiếu question, options hoặc answer)");
    }
  }
}
