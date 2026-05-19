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
var QuizService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const document_analysis_client_1 = require("./document-analysis.client");
const rule_based_generator_1 = require("./rule-based-generator");
const generative_ai_1 = require("@google/generative-ai");
let QuizService = QuizService_1 = class QuizService {
    constructor(prisma, configService, httpService, documentClient) {
        this.prisma = prisma;
        this.configService = configService;
        this.httpService = httpService;
        this.documentClient = documentClient;
        this.logger = new common_1.Logger(QuizService_1.name);
        this.genAI = null;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
    }
    async generateQuiz(documentId, userId) {
        let quiz = await this.prisma.quiz.findFirst({
            where: { documentId },
            include: { questions: true },
        });
        if (quiz && quiz.questions.length > 0) {
            return quiz;
        }
        await this.generateAndCacheBoth(documentId, userId);
        quiz = await this.prisma.quiz.findFirst({
            where: { documentId },
            include: { questions: true },
        });
        if (!quiz || quiz.questions.length === 0) {
            throw new common_1.BadRequestException('Không thể tạo quiz từ tài liệu này.');
        }
        return quiz;
    }
    async generateFlashcards(documentId, userId) {
        let cards = await this.prisma.flashcard.findMany({
            where: { documentId, userId },
        });
        if (cards.length > 0) {
            return cards;
        }
        await this.generateAndCacheBoth(documentId, userId);
        cards = await this.prisma.flashcard.findMany({
            where: { documentId, userId },
        });
        if (cards.length === 0) {
            throw new common_1.BadRequestException('Không thể tạo flashcard từ tài liệu này.');
        }
        return cards;
    }
    async generateAndCacheBoth(documentId, userId) {
        this.logger.log(`[one-pass-ai] Bắt đầu xử lý gộp cho document=${documentId}`);
        const text = await this.documentClient.fetchDocumentText(documentId);
        if (!text?.trim()) {
            throw new common_1.NotFoundException(`Tài liệu ${documentId} chưa sẵn sàng. Đợi trạng thái READY hoặc tải lại file.`);
        }
        let result;
        if (this.genAI) {
            try {
                const modelName = this.configService.get('GEMINI_MODEL') || 'gemini-2.5-flash';
                const model = this.genAI.getGenerativeModel({ model: modelName });
                const prompt = `Bạn là chuyên gia giáo dục. Hãy đọc tài liệu dưới đây và tạo ra:
1. Một bộ Quiz 10 câu hỏi trắc nghiệm (về từ vựng, ngữ pháp, ý chính).
2. Một bộ 12 thẻ Flashcard (mặt trước là khái niệm/từ vựng tiếng Anh, mặt sau là giải nghĩa tiếng Việt).

Tài liệu:
"""
${text.slice(0, 15000)}
"""

CHỈ trả về kết quả dưới định dạng JSON hợp lệ (không chứa ký tự markdown như \`\`\`json), với cấu trúc chính xác như sau:
{
  "questions": [
    { "questionText": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "ghi chính xác nội dung text của đáp án đúng, KHÔNG dùng A B C D", "explanation": "..." }
  ],
  "flashcards": [
    { "front": "...", "back": "..." }
  ]
}
`;
                const response = await model.generateContent(prompt);
                let rawText = response.response.text().trim();
                if (rawText.startsWith('```json')) {
                    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
                }
                result = JSON.parse(rawText);
                this.logger.log(`[one-pass-ai] Gemini thành công cho document=${documentId}`);
            }
            catch (err) {
                this.logger.error(`[one-pass-ai] Gemini failed: ${err.message}. Fallback to local.`);
                result = (0, rule_based_generator_1.buildAnalysisFromText)(text);
            }
        }
        else {
            this.logger.warn(`[one-pass-ai] Không có GEMINI_API_KEY. Dùng local.`);
            result = (0, rule_based_generator_1.buildAnalysisFromText)(text);
        }
        const questions = result.questions?.slice(0, 10) ?? [];
        if (questions.length > 0) {
            const existingQuiz = await this.prisma.quiz.findFirst({ where: { documentId } });
            if (!existingQuiz) {
                await this.prisma.quiz.create({
                    data: {
                        documentId,
                        title: `Quiz - ${documentId.slice(0, 8)}`,
                        questions: {
                            create: questions.map((q) => {
                                let correct = q.correctAnswer;
                                if (correct && /^[A-D]$/i.test(correct.trim())) {
                                    const idx = correct.trim().toUpperCase().charCodeAt(0) - 65;
                                    if (q.options && idx >= 0 && idx < q.options.length) {
                                        correct = q.options[idx];
                                    }
                                }
                                return {
                                    questionText: q.questionText,
                                    options: q.options,
                                    correctAnswer: correct,
                                    explanation: q.explanation || '',
                                };
                            }),
                        },
                    },
                });
            }
        }
        const flashcards = result.flashcards?.slice(0, 12) ?? [];
        if (flashcards.length > 0 && userId) {
            const existingCards = await this.prisma.flashcard.count({ where: { documentId, userId } });
            if (existingCards === 0) {
                await Promise.all(flashcards.map((card) => this.prisma.flashcard.create({
                    data: {
                        documentId,
                        userId,
                        front: card.front,
                        back: card.back,
                    },
                })));
            }
        }
    }
    async getQuiz(id) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: {
                questions: {
                    select: {
                        id: true,
                        questionText: true,
                        options: true,
                        correctAnswer: true,
                    },
                },
            },
        });
        if (!quiz)
            throw new common_1.NotFoundException(`Quiz ${id} not found`);
        return quiz;
    }
    async listQuizzes(userId, skip = 0, take = 10) {
        const quizzes = await this.prisma.quiz.findMany({
            skip, take,
            include: { questions: { select: { id: true, questionText: true, options: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const total = await this.prisma.quiz.count();
        return { data: quizzes, pagination: { skip, take, total } };
    }
    async deleteQuiz(id) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        await this.prisma.$transaction([
            this.prisma.quizAttempt.deleteMany({ where: { quizId: id } }),
            this.prisma.question.deleteMany({ where: { quizId: id } }),
            this.prisma.quiz.delete({ where: { id } }),
        ]);
        return { success: true };
    }
    async submitQuiz(quizId, userId, answers) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true },
        });
        if (!quiz)
            throw new common_1.NotFoundException(`Quiz ${quizId} not found`);
        let score = 0;
        const total = quiz.questions.length;
        for (const q of quiz.questions) {
            if (answers[q.id] === q.correctAnswer)
                score++;
        }
        const attempt = await this.prisma.quizAttempt.create({
            data: { quizId, userId, score, total, answers },
        });
        this.notifyDashboardOfQuizCompleted(userId, quizId, score, total);
        return attempt;
    }
    async listFlashcards(userId, documentId) {
        return this.prisma.flashcard.findMany({
            where: { userId, ...(documentId && { documentId }) },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteFlashcard(userId, id) {
        const card = await this.prisma.flashcard.findUnique({ where: { id } });
        if (!card || card.userId !== userId)
            throw new common_1.NotFoundException('Flashcard not found');
        await this.prisma.flashcard.delete({ where: { id } });
        return { success: true };
    }
    async notifyDashboardOfQuizCompleted(userId, quizId, score, total) {
        try {
            const url = this.configService.get('DASHBOARD_SERVICE_URL') || 'http://localhost:3002';
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${url}/api/dashboard/events/quiz-completed`, {
                user_id: userId,
                quiz_id: quizId,
                score: Math.round((score / total) * 100),
                total_questions: total,
                occurred_at: new Date().toISOString(),
            }));
        }
        catch (err) {
            this.logger.warn(`Dashboard notify failed: ${err.message}`);
        }
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = QuizService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        axios_1.HttpService,
        document_analysis_client_1.DocumentAnalysisClient])
], QuizService);
//# sourceMappingURL=quiz.service.js.map