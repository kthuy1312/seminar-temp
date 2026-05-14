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
    generateQuiz(dto: GenerateQuizDto): Promise<{
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
    submitQuiz(dto: SubmitQuizDto): Promise<{
        id: string;
        createdAt: Date;
        quizId: string;
        userId: string;
        score: number;
        total: number;
        answers: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
