"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let AiService = AiService_1 = class AiService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AiService_1.name);
        const apiKey = this.configService.get('GEMINI_API_KEY');
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || '');
    }
    async summarizeText(text) {
        if (!this.configService.get('GEMINI_API_KEY')) {
            throw new Error('GEMINI_API_KEY is missing in environment variables. Please add it to your .env file to enable AI summarization.');
        }
        const maxRetries = 3;
        const timeoutMs = 60000;
        const modelName = this.configService.get('GEMINI_MODEL') || 'gemini-2.5-flash';
        const inputText = text.length > 30000 ? `${text.slice(0, 30000)}\n\n[...đã cắt bớt...]` : text;
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
                const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }, { signal: controller.signal });
                clearTimeout(timeoutId);
                const response = result.response;
                return response.text();
            }
            catch (error) {
                clearTimeout(timeoutId);
                const isTimeout = error.name === 'AbortError' || error.message === 'RequestTimeout';
                if (isTimeout) {
                    this.logger.error(`Gemini API timeout after ${timeoutMs}ms on attempt ${attempt}`);
                    if (attempt >= maxRetries) {
                        throw new Error('Gemini API request timed out');
                    }
                }
                else {
                    const is429 = error?.status === 429 || error?.message?.includes('429');
                    if (is429) {
                        throw new Error('Đã vượt hạn mức Gemini API (quota). Vui lòng đợi 1 phút hoặc đổi API key trong .env.');
                    }
                    const is503 = error?.status === 503 || error?.message?.includes('503');
                    if (!is503) {
                        this.logger.error('Error calling Gemini API', error);
                        throw new Error(error?.message || 'Không thể gọi Gemini API. Kiểm tra GEMINI_API_KEY trong .env.');
                    }
                    this.logger.warn(`Gemini API 503 error. Retrying in attempt ${attempt}...`);
                    if (attempt >= maxRetries) {
                        this.logger.error('Max retries reached for Gemini API 503 error');
                        throw new Error('Failed to summarize text due to 503 Service Unavailable');
                    }
                }
                const backoffMs = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, backoffMs));
            }
        }
        throw new Error('Failed to summarize text after retries');
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map