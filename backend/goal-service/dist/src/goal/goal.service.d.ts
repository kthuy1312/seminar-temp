import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto, CreateMilestoneDto, UpdateMilestoneDto } from './dto';
export declare class GoalService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(userId: string, createGoalDto: CreateGoalDto): Promise<{
        milestones: {
            title: string;
            created_at: Date;
            updated_at: Date;
            id: string;
            goal_id: string;
            is_done: boolean;
            due_date: Date | null;
        }[];
    } & {
        description: string | null;
        title: string;
        category: string | null;
        target_date: Date | null;
        status: string;
        progress: number;
        created_at: Date;
        updated_at: Date;
        id: string;
        user_id: string;
    }>;
    findAll(userId: string, query?: {
        status?: string;
        category?: string;
        page?: number;
        limit?: number;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    }): Promise<{
        data: ({
            milestones: {
                title: string;
                created_at: Date;
                updated_at: Date;
                id: string;
                goal_id: string;
                is_done: boolean;
                due_date: Date | null;
            }[];
        } & {
            description: string | null;
            title: string;
            category: string | null;
            target_date: Date | null;
            status: string;
            progress: number;
            created_at: Date;
            updated_at: Date;
            id: string;
            user_id: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    findOne(userId: string, id: string): Promise<{
        milestones: {
            title: string;
            created_at: Date;
            updated_at: Date;
            id: string;
            goal_id: string;
            is_done: boolean;
            due_date: Date | null;
        }[];
    } & {
        description: string | null;
        title: string;
        category: string | null;
        target_date: Date | null;
        status: string;
        progress: number;
        created_at: Date;
        updated_at: Date;
        id: string;
        user_id: string;
    }>;
    update(userId: string, id: string, updateGoalDto: UpdateGoalDto): Promise<{
        milestones: {
            title: string;
            created_at: Date;
            updated_at: Date;
            id: string;
            goal_id: string;
            is_done: boolean;
            due_date: Date | null;
        }[];
    } & {
        description: string | null;
        title: string;
        category: string | null;
        target_date: Date | null;
        status: string;
        progress: number;
        created_at: Date;
        updated_at: Date;
        id: string;
        user_id: string;
    }>;
    remove(userId: string, id: string): Promise<{
        description: string | null;
        title: string;
        category: string | null;
        target_date: Date | null;
        status: string;
        progress: number;
        created_at: Date;
        updated_at: Date;
        id: string;
        user_id: string;
    }>;
    addMilestone(userId: string, goalId: string, createMilestoneDto: CreateMilestoneDto): Promise<{
        title: string;
        created_at: Date;
        updated_at: Date;
        id: string;
        goal_id: string;
        is_done: boolean;
        due_date: Date | null;
    }>;
    updateMilestone(userId: string, goalId: string, milestoneId: string, updateMilestoneDto: UpdateMilestoneDto): Promise<{
        title: string;
        created_at: Date;
        updated_at: Date;
        id: string;
        goal_id: string;
        is_done: boolean;
        due_date: Date | null;
    }>;
    removeMilestone(userId: string, goalId: string, milestoneId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private recalculateGoalProgress;
}
