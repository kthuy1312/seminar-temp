"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIResponseParser = void 0;
const common_1 = require("@nestjs/common");
class AIResponseParser {
    static logger = new common_1.Logger(AIResponseParser.name);
    static parseQuizResponse(aiRawText) {
        try {
            let cleanText = aiRawText.trim();
            cleanText = cleanText.replace(/^```(json)?/i, '').trim();
            cleanText = cleanText.replace(/```$/i, '').trim();
            const firstBrace = cleanText.indexOf('{');
            const lastBrace = cleanText.lastIndexOf('}');
            if (firstBrace === -1 || lastBrace === -1) {
                throw new Error("Không tìm thấy cấu trúc JSON hợp lệ (thiếu dấu ngoặc {}).");
            }
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
            const parsedData = JSON.parse(cleanText);
            this.validateStructure(parsedData);
            return parsedData;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Lỗi khi parse response từ AI: ${errorMessage}`);
            this.logger.debug(`Raw Text bị lỗi: ${aiRawText}`);
            throw new common_1.InternalServerErrorException('Hệ thống AI trả về định dạng dữ liệu không hợp lệ. Vui lòng thử lại.');
        }
    }
    static validateStructure(data) {
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
exports.AIResponseParser = AIResponseParser;
//# sourceMappingURL=ai-parser.util.js.map