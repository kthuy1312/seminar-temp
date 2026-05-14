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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
const axios_1 = __importDefault(require("axios"));
let QuizService = class QuizService {
    prisma;
    configService;
    genAI;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY') || 'dummy-key';
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
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
        let questions = [];
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
            const prompt = `
        Based on the following summary, generate 5 multiple-choice questions.
        Provide the result as a JSON array where each object has:
        - questionText: string
        - options: string[] (array of 4 options)
        - correctAnswer: string (the exact text of the correct option)
        - explanation: string (why the answer is correct)

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
                    title: `Quiz for Document ${documentId}`,
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
            return attempt;
        }
        catch (error) {
            console.error('Error saving quiz attempt:', error.message);
            throw new common_1.InternalServerErrorException('Failed to save quiz attempt');
        }
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], QuizService);
//# sourceMappingURL=quiz.service.js.map