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
    prisma;
    configService;
    httpService;
    logger = new common_1.Logger(TutorService_1.name);
    genAI;
    constructor(prisma, configService, httpService) {
        this.prisma = prisma;
        this.configService = configService;
        this.httpService = httpService;
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
            const summary = await this.getSummaryFromService(documentId);
            if (!summary) {
                throw new common_1.NotFoundException(`Summary for document ${documentId} not found`);
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
            const answer = await this.generateAnswer(question, summary, conversation.messages || []);
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
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to process question');
        }
    }
    async getSummaryFromService(documentId) {
        try {
            const summaryServiceUrl = this.configService.get('SUMMARY_SERVICE_URL', 'http://localhost:3006');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${summaryServiceUrl}/api/summaries/document/${documentId}`));
            const summary = response.data?.data?.content ||
                response.data?.summary ||
                response.data?.content;
            return summary ? summary : null;
        }
        catch (error) {
            this.logger.error(`Failed to fetch summary from Summary Service: ${error.message}`);
            return `Tai lieu tham chieu cho document ${documentId} hien chua co ban tom tat. Hay tra loi dua tren kien thuc hoc tap tong quat va noi ro khi thong tin khong co trong tai lieu.`;
        }
    }
    async generateAnswer(question, summary, previousMessages) {
        if (!this.genAI) {
            return this.generateFallbackAnswer(question, summary);
        }
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
        }
        catch (error) {
            this.logger.error(`AI generation failed: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to generate answer from AI');
        }
    }
    generateFallbackAnswer(question, summary) {
        return [
            `Tom tat lien quan: ${summary.slice(0, 400)}${summary.length > 400 ? '...' : ''}`,
            `Tra loi ngan gon cho cau hoi "${question}":`,
            '- He thong local dang chay o che do fallback vi GEMINI_API_KEY chua duoc cau hinh.',
            '- Ban co the cau hinh GEMINI_API_KEY de nhan cau tra loi AI day du hon.',
            '- Dua tren ngu canh hien co, hay doi chieu cau hoi voi phan tom tat tai lieu de tiep tuc hoc.',
        ].join('\n');
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