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
    configService;
    logger = new common_1.Logger(AiService_1.name);
    genAI;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || '');
    }
    async summarizeText(text) {
        if (!this.configService.get('GEMINI_API_KEY')) {
            return this.buildFallbackSummary(text);
        }
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
                const backoffMs = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, backoffMs));
            }
        }
        throw new Error('Failed to summarize text after retries');
    }
    buildFallbackSummary(text) {
        const normalized = text.replace(/\s+/g, ' ').trim();
        const chunks = normalized
            .split(/(?<=[.!?])\s+/)
            .filter(Boolean)
            .slice(0, 5);
        if (chunks.length === 0) {
            return '- Tai lieu chua co noi dung de tom tat.';
        }
        return chunks.map((chunk) => `- ${chunk}`).join('\n');
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map