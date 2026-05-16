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
const gemini_error_util_1 = require("./gemini-error.util");
let TutorService = TutorService_1 = class TutorService {
    constructor(prisma, configService, httpService) {
        this.prisma = prisma;
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(TutorService_1.name);
        this.genAI = null;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        const model = this.configService.get('GEMINI_MODEL') || 'gemini-2.5-flash-lite';
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.logger.log(`[tutor] Gemini ready model=${model} key=...${apiKey.slice(-6)}`);
        }
        else {
            this.logger.warn('[tutor] GEMINI_API_KEY is not configured');
        }
    }
    async askQuestion(askDto) {
        const { question, documentId, conversationId } = askDto;
        try {
            const { documentText, summary, chunks, aiSource } = await this.getDocumentContext(documentId);
            if (!documentText?.trim()) {
                throw new common_1.BadRequestException('Tài liệu chưa có nội dung văn bản. Hãy tải lại file PDF/DOCX/TXT.');
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
            const relevantChunks = this.selectChunks(chunks, question, documentText);
            const { answer, usedFallback, fallbackHint } = await this.generateAnswer(question, documentText, summary, relevantChunks, conversation.messages || [], aiSource);
            if (usedFallback) {
                this.logger.warn(`[tutor] fallback activated document=${documentId} aiSource=${aiSource ?? 'none'}`);
            }
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
                fallback: usedFallback,
                fallbackHint: usedFallback ? fallbackHint : undefined,
                model: this.configService.get('GEMINI_MODEL') || 'gemini-2.5-flash',
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`[tutor] ask failed: ${message}`);
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            return {
                conversationId: askDto.conversationId ?? null,
                answer: 'AI hiện đang bận hoặc hết quota. Hệ thống đang sử dụng chế độ xử lý cục bộ. ' +
                    'Bạn vẫn có thể đọc nội dung tài liệu và thử lại sau.',
                fallback: true,
            };
        }
    }
    async getDocumentContext(documentId) {
        const documentServiceUrl = this.configService.get('DOCUMENT_SERVICE_URL', 'http://localhost:3003');
        let documentText = '';
        let summary = null;
        let chunks = [];
        let aiSource = null;
        try {
            const res = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${documentServiceUrl}/api/documents/${documentId}`));
            const doc = res.data?.data ?? res.data;
            documentText =
                doc?.processedContent ?? doc?.extractedText ?? doc?.rawText ?? '';
            summary = doc?.aiAnalysis?.summary ?? null;
            chunks = doc?.chunks ?? [];
            aiSource = doc?.aiSource ?? null;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`[tutor] document fetch failed: ${message}`);
        }
        if (!documentText?.trim()) {
            documentText = await this.getDocumentText(documentId);
        }
        if (!summary) {
            summary = await this.getSummaryOptional(documentId);
        }
        return { documentText, summary, chunks, aiSource };
    }
    async getDocumentText(documentId) {
        try {
            const documentServiceUrl = this.configService.get('DOCUMENT_SERVICE_URL', 'http://localhost:3003');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${documentServiceUrl}/api/documents/${documentId}/extract`));
            return response.data?.data?.text ?? response.data?.text ?? '';
        }
        catch {
            return '';
        }
    }
    async getSummaryOptional(documentId) {
        try {
            const summaryServiceUrl = this.configService.get('SUMMARY_SERVICE_URL', 'http://localhost:3006');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${summaryServiceUrl}/api/summaries/document/${documentId}`));
            return (response.data?.data?.content ||
                response.data?.summary ||
                response.data?.content ||
                null);
        }
        catch {
            return null;
        }
    }
    selectChunks(chunks, query, fullText) {
        if (chunks?.length) {
            const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
            const scored = chunks.map((c) => {
                const lower = c.text.toLowerCase();
                let score = 0;
                for (const t of terms) {
                    if (lower.includes(t))
                        score += 1;
                }
                return { text: c.text, score };
            });
            const best = scored
                .sort((a, b) => b.score - a.score)
                .filter((s) => s.score > 0)
                .slice(0, 4);
            if (best.length) {
                return best.map((b) => b.text).join('\n\n---\n\n');
            }
            return chunks
                .slice(0, 3)
                .map((c) => c.text)
                .join('\n\n---\n\n');
        }
        return this.truncateText(fullText, 12000);
    }
    truncateText(text, maxChars) {
        if (text.length <= maxChars)
            return text;
        return `${text.slice(0, maxChars)}\n\n[... nội dung bị cắt bớt ...]`;
    }
    async generateAnswer(question, documentText, summary, chunkContext, previousMessages, aiSource) {
        if (!this.genAI || !this.configService.get('GEMINI_API_KEY')) {
            return {
                answer: this.buildFallbackAnswer(question, chunkContext, summary, 'GEMINI_API_KEY chưa cấu hình trong tutor-service/.env'),
                usedFallback: true,
                fallbackHint: 'missing_key',
            };
        }
        try {
            const modelName = this.configService.get('GEMINI_MODEL') || 'gemini-2.5-flash';
            const model = this.genAI.getGenerativeModel({ model: modelName });
            let historyContext = '';
            if (previousMessages?.length) {
                historyContext =
                    'Previous conversation:\n' +
                        previousMessages
                            .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
                            .join('\n') +
                        '\n\n';
            }
            const summaryBlock = summary
                ? `\n=== TÓM TẮT (cache) ===\n"""\n${summary}\n"""\n`
                : '';
            const prompt = `Bạn là Gia sư Tiếng Anh AI. Trả lời DỰA TRÊN NGỮ CẢNH TÀI LIỆU.

=== ĐOẠN LIÊN QUAN ===
"""
${this.truncateText(chunkContext, 20000)}
"""
${summaryBlock}
${historyContext}

Câu hỏi: ${question}

Trả lời Markdown ngắn gọn, tiếng Việt, giữ câu tiếng Anh từ tài liệu.`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            this.logger.log(`[tutor] provider=gemini model=${modelName} aiSource=${aiSource ?? 'live'}`);
            return { answer: text, usedFallback: false };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const kind = (0, gemini_error_util_1.classifyGeminiError)(message);
            const hint = (0, gemini_error_util_1.userFacingGeminiHint)(kind);
            this.logger.warn(`[tutor] ${kind} — fallback activated: ${hint}`);
            return {
                answer: this.buildFallbackAnswer(question, chunkContext, summary, hint),
                usedFallback: true,
                fallbackHint: kind,
            };
        }
    }
    buildFallbackAnswer(question, context, summary, reason) {
        const q = question.toLowerCase();
        const excerpt = context.slice(0, 1500);
        const lines = [
            `**${reason || 'AI hiện không khả dụng. Hệ thống đang sử dụng chế độ xử lý cục bộ.'}**`,
            '',
        ];
        if (summary) {
            lines.push('### Tóm tắt có sẵn');
            lines.push(summary.slice(0, 800));
            lines.push('');
        }
        if (excerpt) {
            lines.push('### Đoạn liên quan trong tài liệu');
            lines.push(`> ${excerpt.replace(/\n/g, '\n> ')}`);
            lines.push('');
        }
        lines.push('### Gợi ý', '- Tìm từ khóa trong đoạn trên để tự suy luận đáp án.', '- Thử lại sau khi quota Gemini được reset.');
        if (q.includes('nghĩa') || q.includes('meaning')) {
            lines.push('- Với câu hỏi từ vựng: đối chiếu dòng dạng `word - nghĩa` trong file.');
        }
        return lines.join('\n');
    }
    async getHistory(userId, documentId, skip = 0, take = 10) {
        try {
            const conversations = await this.prisma.conversation.findMany({
                where: documentId ? { documentId } : {},
                include: {
                    messages: { orderBy: { createdAt: 'asc' } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            });
            const total = await this.prisma.conversation.count({
                where: documentId ? { documentId } : {},
            });
            return {
                data: conversations.map((conv) => ({
                    conversationId: conv.id,
                    documentId: conv.documentId,
                    messages: conv.messages,
                })),
                pagination: { skip, take, total },
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`[tutor] history failed: ${message}`);
            throw new common_1.BadRequestException('Failed to fetch tutor history');
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