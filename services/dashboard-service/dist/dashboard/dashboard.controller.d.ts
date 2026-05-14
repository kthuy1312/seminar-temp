import { DashboardService } from './dashboard.service';
import { GetActivityQueryDto } from './dto/get-activity-query.dto';
import { GetProgressQueryDto } from './dto/get-progress-query.dto';
import { GetStatsQueryDto } from './dto/get-stats-query.dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(query: GetStatsQueryDto, headerUserId?: string): Promise<{
        success: boolean;
        data: {
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
    getActivity(query: GetActivityQueryDto, headerUserId?: string): Promise<{
        success: boolean;
        data: {
            userId: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
    getProgress(query: GetProgressQueryDto, headerUserId?: string): Promise<{
        success: boolean;
        data: {
            completedGoals: number;
            quizzes: number;
            docs: number;
            date: string;
        }[];
    }>;
}
