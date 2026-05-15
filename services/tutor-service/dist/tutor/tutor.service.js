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
var TutorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let TutorService = TutorService_1 = class TutorService {
    constructor(prisma, configService, httpService) {
        this.prisma = prisma;
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(TutorService_1.name);
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY is not configured');
        }
        else {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
    }
    async askQuestion(askDto) {
        const { question, documentId, conversationId } = askDto;
        try {
            const { documentText, summary } = await this.getDocumentContext(documentId);
            if (!documentText?.trim()) {
                throw new common_1.BadRequestException('Tài liệu chưa có nội dung văn bản. Hãy tải lại file PDF/DOCX hoặc vào trang Tài liệu → Tạo tóm tắt trước.');
            }
            let conversation;
            if (conversationId) {
                conversation = await this.prisma.conversation.findUnique({
                    where: { id: conversationId },
                    include: { messages: true },
                });
                if (!conversation) {
                    throw new common_1.NotFoundException(`Conversation ${conversationId} not found`);
                }
            }
            else {
                conversation = await this.prisma.conversation.create({
                    data: { documentId },
                    include: { messages: true },
                });
            }
            await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    role: 'user',
                    content: question,
                },
            });
            const answer = await this.generateAnswer(question, documentText, summary, conversation.messages || []);
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
        }
        catch (error) {
            this.logger.error(`Error processing ask request: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to process question');
        }
    }
    async getDocumentContext(documentId) {
        const documentText = await this.getDocumentText(documentId);
        const summary = await this.getSummaryOptional(documentId);
        return { documentText, summary };
    }
    async getDocumentText(documentId) {
        try {
            const documentServiceUrl = this.configService.get('DOCUMENT_SERVICE_URL', 'http://localhost:3003');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${documentServiceUrl}/api/documents/${documentId}/extract`));
            const text = response.data?.data?.text ??
                response.data?.text ??
                '';
            if (text) {
                this.logger.log(`Loaded document text for ${documentId}: ${text.length} chars`);
            }
            return text;
        }
        catch (error) {
            this.logger.error(`Failed to fetch document text for ${documentId}: ${error.message}`);
            return '';
        }
    }
    async getSummaryOptional(documentId) {
        try {
            const summaryServiceUrl = this.configService.get('SUMMARY_SERVICE_URL', 'http://localhost:3006');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${summaryServiceUrl}/api/summaries/document/${documentId}`));
            const summary = response.data?.data?.content ||
                response.data?.summary ||
                response.data?.content;
            return summary || null;
        }
        catch {
            return null;
        }
    }
    truncateText(text, maxChars) {
        if (text.length <= maxChars)
            return text;
        return `${text.slice(0, maxChars)}\n\n[... nội dung bị cắt bớt do giới hạn độ dài ...]`;
    }
    async generateAnswer(question, documentText, summary, previousMessages) {
        if (!this.genAI) {
            throw new common_1.InternalServerErrorException('GEMINI_API_KEY is missing. Please add it to your .env file to enable AI tutoring.');
        }
        try {
            const modelName = this.configService.get('GEMINI_MODEL') || 'gemini-2.5-flash';
            const model = this.genAI.getGenerativeModel({ model: modelName });
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
        }
        catch (error) {
            this.logger.error(`AI generation failed: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to generate answer from AI');
        }
    }
    async getHistory(userId, documentId, skip = 0, take = 10) {
        try {
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
        }
        catch (error) {
            this.logger.error(`Error fetching tutor history: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to fetch tutor history');
        }
    }
};
exports.TutorService = TutorService;
exports.TutorService = TutorService = TutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        axios_1.HttpService])
], TutorService);
//# sourceMappingURL=tutor.service.js.map