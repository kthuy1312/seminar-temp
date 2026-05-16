import { QuizService } from './quiz.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
export declare class QuizController {
    private readonly quizService;
    constructor(quizService: QuizService);
    listQuizzes(userId: string, skip?: string, take?: string): Promise<{
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
    generateQuiz(userId: string, dto: GenerateQuizDto): Promise<{
        questions: {
            id: string;
            quizId: string;
            questionText: string;
            options: import("@prisma/client/runtime/library").JsonValue;
            correctAnswer: string;
            explanation: string | null;
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
            correctAnswer: string;
        }[];
    } & {
        id: string;
        documentId: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    submitQuiz(dto: SubmitQuizDto): Promise<{
        id: string;
        createdAt: Date;
        quizId: string;
        userId: string;
        score: number;
        total: number;
        answers: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deleteQuiz(id: string): Promise<{
        success: boolean;
    }>;
    listFlashcards(userId: string, documentId?: string): Promise<{
        id: string;
        documentId: string;
        createdAt: Date;
        userId: string;
        front: string;
        back: string;
    }[]>;
    generateFlashcards(userId: string, documentId: string): Promise<{
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
}
