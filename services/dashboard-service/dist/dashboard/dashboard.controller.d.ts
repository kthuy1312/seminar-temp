import { DashboardService } from './dashboard.service';
import { GetActivityQueryDto } from './dto/get-activity-query.dto';
import { GetProgressQueryDto } from './dto/get-progress-query.dto';
import { GetStatsQueryDto } from './dto/get-stats-query.dto';
import { GoalCreatedEventDto } from './dto/events/goal-created-event.dto';
import { GoalCompletedEventDto } from './dto/events/goal-completed-event.dto';
import { DocumentUploadedEventDto } from './dto/events/document-uploaded-event.dto';
import { QuizCompletedEventDto } from './dto/events/quiz-completed-event.dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(query: GetStatsQueryDto, headerUserId?: string): Promise<{
        userId: string;
        id: string;
        totalGoals: number;
        completedGoals: number;
        totalDocuments: number;
        totalQuizzes: number;
        avgQuizScore: import("@prisma/client/runtime/library").Decimal;
        studyStreak: number;
        lastActive: Date | null;
        updatedAt: Date;
        createdAt: Date;
    } | {
        totalUsers: number;
        totals: {
            totalGoals: number;
            completedGoals: number;
            totalDocuments: number;
            totalQuizzes: number;
        };
        averages: {
            avgQuizScore: number;
            avgStudyStreak: number;
        };
    }>;
    getActivity(query: GetActivityQueryDto, headerUserId?: string): Promise<{
        data: {
            userId: string;
            id: string;
            createdAt: Date;
            action: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    getProgress(query: GetProgressQueryDto, headerUserId?: string): Promise<{
        completedGoals: number;
        quizzes: number;
        docs: number;
        date: string;
    }[]>;
    handleGoalCreated(payload: GoalCreatedEventDto): Promise<void>;
    handleGoalCompleted(payload: GoalCompletedEventDto): Promise<void>;
    handleDocumentUploaded(payload: DocumentUploadedEventDto): Promise<void>;
    handleQuizCompleted(payload: QuizCompletedEventDto): Promise<void>;
}
