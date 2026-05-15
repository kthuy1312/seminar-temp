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
const generative_ai_1 = require("@google/generative-ai");
const axios_1 = require("axios");
const axios_2 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let QuizService = QuizService_1 = class QuizService {
    constructor(prisma, configService, httpService) {
        this.prisma = prisma;
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(QuizService_1.name);
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            this.genAI = null;
        }
        else {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
    }
    async generateQuiz(documentId) {
        let summaryText = '';
        try {
            const summaryServiceUrl = this.configService.get('SUMMARY_SERVICE_URL') ||
                'http://localhost:3006';
            const response = await axios_1.default.get(`${summaryServiceUrl}/api/summaries/document/${documentId}`);
            if (response.data && response.data.success && response.data.data && response.data.data.content) {
                summaryText = response.data.data.content;
            }
            else {
                throw new Error('Summary content not found in response');
            }
        }
        catch (error) {
            console.error('Error fetching summary:', error.message);
            throw new common_1.NotFoundException(`Summary for document ${documentId} not found`);
        }
        if (!this.genAI) {
            throw new common_1.InternalServerErrorException('GEMINI_API_KEY is missing. Please add it to your .env file to enable quiz generation.');
        }
        let questions = [];
        try {
            const modelName = this.configService.get('GEMINI_MODEL') || 'gemini-2.5-flash';
            const model = this.genAI.getGenerativeModel({ model: modelName });
            const prompt = `
        Based on this English learning material summary, generate 5 multiple-choice questions.
        Focus on: vocabulary, grammar, reading comprehension, or TOEIC/IELTS-style items.
        Mix question types across the set. Questions in English; explanations in Vietnamese.

        Each object:
        - questionText: string (English)
        - options: string[] (4 options in English)
        - correctAnswer: string (exact match to one option)
        - explanation: string (Vietnamese, why correct)

        Summary:
        ${summaryText}

        Return ONLY the JSON array.
      `;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonStr = text.replace(/```json\n|\n```|```/g, '').trim();
            questions = JSON.parse(jsonStr);
        }
        catch (error) {
            console.error('AI generation failed:', error.message);
            throw new common_1.InternalServerErrorException('Failed to generate quiz questions');
        }
        try {
            const quiz = await this.prisma.quiz.create({
                data: {
                    documentId,
                    title: `English Quiz - ${documentId.slice(0, 8)}`,
                    questions: {
                        create: questions.map((q) => ({
                            questionText: q.questionText,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation,
                        })),
                    },
                },
                include: {
                    questions: true,
                },
            });
            return quiz;
        }
        catch (error) {
            console.error('Error saving quiz:', error.message);
            throw new common_1.InternalServerErrorException('Failed to save quiz to database');
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
                    }
                }
            }
        });
        if (!quiz) {
            throw new common_1.NotFoundException(`Quiz ${id} not found`);
        }
        return quiz;
    }
    async listQuizzes(userId, skip = 0, take = 10) {
        try {
            const quizzes = await this.prisma.quiz.findMany({
                skip,
                take,
                include: {
                    questions: {
                        select: {
                            id: true,
                            questionText: true,
                            options: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            const total = await this.prisma.quiz.count();
            return {
                data: quizzes,
                pagination: {
                    skip,
                    take,
                    total,
                },
            };
        }
        catch (error) {
            console.error('Error listing quizzes:', error.message);
            throw new common_1.InternalServerErrorException('Failed to list quizzes');
        }
    }
    async submitQuiz(quizId, userId, answers) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true },
        });
        if (!quiz) {
            throw new common_1.NotFoundException(`Quiz ${quizId} not found`);
        }
        let score = 0;
        const total = quiz.questions.length;
        for (const q of quiz.questions) {
            if (answers[q.id] === q.correctAnswer) {
                score++;
            }
        }
        try {
            const attempt = await this.prisma.quizAttempt.create({
                data: {
                    quizId,
                    userId,
                    score,
                    total,
                    answers,
                },
            });
            this.notifyDashboardOfQuizCompleted(userId, quizId, score, total);
            return attempt;
        }
        catch (error) {
            console.error('Error saving quiz attempt:', error.message);
            throw new common_1.InternalServerErrorException('Failed to save quiz attempt');
        }
    }
    async generateFlashcards(documentId, userId) {
        let summaryText = '';
        try {
            const summaryServiceUrl = this.configService.get('SUMMARY_SERVICE_URL') ||
                'http://localhost:3006';
            const response = await axios_1.default.get(`${summaryServiceUrl}/api/summaries/document/${documentId}`);
            summaryText =
                response.data?.data?.content ||
                    response.data?.summary ||
                    response.data?.content ||
                    '';
            if (!summaryText) {
                throw new Error('Summary content not found');
            }
        }
        catch (error) {
            console.error('Error fetching summary for flashcards:', error.message);
            throw new common_1.NotFoundException(`Summary for document ${documentId} not found`);
        }
        if (!this.genAI) {
            throw new common_1.InternalServerErrorException('GEMINI_API_KEY is missing.');
        }
        try {
            const modelName = this.configService.get('GEMINI_MODEL') || 'gemini-2.5-flash';
            const model = this.genAI.getGenerativeModel({ model: modelName });
            const prompt = `
        Từ tóm tắt tài liệu học tiếng Anh sau, tạo 6-8 flashcards từ vựng/ngữ pháp.

        Mỗi flashcard:
        - front: từ/cụm tiếng Anh (word or phrase)
        - back: định dạng nhiều dòng tiếng Việt:
          Nghĩa: [nghĩa tiếng Việt]
          Ví dụ: [câu ví dụ tiếng Anh]
          Phát âm/Ghi chú: [IPA hoặc ghi chú ngắn nếu có, hoặc "—"]

        Tóm tắt:
        ${summaryText}

        Trả về DUY NHẤT JSON array [{"front":"...","back":"..."}], không Markdown.
      `;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonStr = text.replace(/```json\n|\n```|```/g, '').trim();
            const cards = JSON.parse(jsonStr);
            const savedCards = await Promise.all(cards.map((card) => this.prisma.flashcard.create({
                data: {
                    documentId,
                    userId,
                    front: card.front,
                    back: card.back,
                },
            })));
            return savedCards;
        }
        catch (error) {
            console.error('Flashcard generation failed:', error.message);
            throw new common_1.InternalServerErrorException('Failed to generate flashcards using AI');
        }
    }
    async listFlashcards(userId, documentId) {
        try {
            return await this.prisma.flashcard.findMany({
                where: {
                    userId,
                    ...(documentId && { documentId }),
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        catch (error) {
            console.error('Error listing flashcards:', error.message);
            throw new common_1.InternalServerErrorException('Failed to fetch flashcards');
        }
    }
    async deleteFlashcard(userId, id) {
        const card = await this.prisma.flashcard.findUnique({ where: { id } });
        if (!card || card.userId !== userId) {
            throw new common_1.NotFoundException('Flashcard not found');
        }
        await this.prisma.flashcard.delete({ where: { id } });
        return { success: true };
    }
    async notifyDashboardOfQuizCompleted(userId, quizId, score, total) {
        try {
            const dashboardServiceUrl = this.configService.get('DASHBOARD_SERVICE_URL') || 'http://localhost:3002';
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${dashboardServiceUrl}/api/dashboard/events/quiz-completed`, {
                user_id: userId,
                quiz_id: quizId,
                score: Math.round((score / total) * 100),
                occurred_at: new Date().toISOString(),
            }));
            this.logger.log(`Notified Dashboard of quiz completion for user ${userId}`);
        }
        catch (err) {
            console.error(`Failed to notify Dashboard of quiz completion: ${err.message}`);
        }
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = QuizService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        axios_2.HttpService])
], QuizService);
//# sourceMappingURL=quiz.service.js.map