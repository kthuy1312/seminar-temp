import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetActivityQueryDto } from './dto/get-activity-query.dto';
import { GetProgressQueryDto } from './dto/get-progress-query.dto';
import { DocumentUploadedEventDto } from './dto/events/document-uploaded-event.dto';
import { GoalCompletedEventDto } from './dto/events/goal-completed-event.dto';
import { GoalCreatedEventDto } from './dto/events/goal-created-event.dto';
import { QuizCompletedEventDto } from './dto/events/quiz-completed-event.dto';
import { RoadmapStepCompletedEventDto } from './dto/events/roadmap-step-completed-event.dto';
import { SummaryCreatedEventDto } from './dto/events/summary-created-event.dto';
import { UserCreatedEventDto } from './dto/events/user-created-event.dto';
export declare class DashboardService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getStats(userId?: string): Promise<{
        success: boolean;
        data: {
            userId: string;
            id: string;
            totalGoals: number;
            completedGoals: number;
            totalDocuments: number;
            totalQuizzes: number;
            avgQuizScore: Prisma.Decimal;
            studyStreak: number;
            lastActive: Date | null;
            updatedAt: Date;
            createdAt: Date;
        };
    } | {
        success: boolean;
        data: {
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
        };
    }>;
    getActivity(query: GetActivityQueryDto): Promise<{
        success: boolean;
        data: {
            userId: string;
            metadata: Prisma.JsonValue | null;
            id: string;
            createdAt: Date;
            action: string;
        }[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    getProgress(query: GetProgressQueryDto): Promise<{
        success: boolean;
        data: {
            completedGoals: number;
            quizzes: number;
            docs: number;
            date: string;
        }[];
    }>;
    handleUserCreated(payload: UserCreatedEventDto): Promise<void>;
    handleGoalCreated(payload: GoalCreatedEventDto): Promise<void>;
    handleGoalCompleted(payload: GoalCompletedEventDto): Promise<void>;
    handleDocumentUploaded(payload: DocumentUploadedEventDto): Promise<void>;
    handleQuizCompleted(payload: QuizCompletedEventDto): Promise<void>;
    handleRoadmapStepCompleted(payload: RoadmapStepCompletedEventDto): Promise<void>;
    handleSummaryCreated(payload: SummaryCreatedEventDto): Promise<void>;
    private ensureUserStats;
    private createActivity;
    private calculateStudyStreak;
    private resolveOccurredAt;
    private toJson;
}
