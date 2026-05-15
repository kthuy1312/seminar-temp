import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class QuizService {
    private prisma;
    private configService;
    private readonly httpService;
    private readonly logger;
    private genAI;
    constructor(prisma: PrismaService, configService: ConfigService, httpService: HttpService);
    generateQuiz(documentId: string): Promise<{
        questions: {
            id: string;
            questionText: string;
            options: import("@prisma/client/runtime/library").JsonValue;
            correctAnswer: string;
            explanation: string | null;
            quizId: string;
        }[];
    } & {
        id: string;
        documentId: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getQuiz(id: string): Promise<{
        questions: {
            id: string;
            questionText: string;
            options: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        id: string;
        documentId: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listQuizzes(userId: string, skip?: number, take?: number): Promise<{
        data: ({
            questions: {
                id: string;
                questionText: string;
                options: import("@prisma/client/runtime/library").JsonValue;
            }[];
        } & {
            id: string;
            documentId: string;
            title: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
        pagination: {
            skip: number;
            take: number;
            total: number;
        };
    }>;
    submitQuiz(quizId: string, userId: string, answers: Record<string, string>): Promise<{
        id: string;
        createdAt: Date;
        quizId: string;
        userId: string;
        score: number;
        total: number;
        answers: import("@prisma/client/runtime/library").JsonValue;
    }>;
    generateFlashcards(documentId: string, userId: string): Promise<any[]>;
    listFlashcards(userId: string, documentId?: string): Promise<{
        id: string;
        documentId: string;
        createdAt: Date;
        userId: string;
        front: string;
        back: string;
    }[]>;
    deleteFlashcard(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    private notifyDashboardOfQuizCompleted;
}
