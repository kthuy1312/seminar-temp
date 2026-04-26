import { GoalService } from './goal.service';
import { CreateGoalDto, UpdateGoalDto, CreateMilestoneDto, UpdateMilestoneDto, GoalQueryDto } from './dto';
export declare class GoalController {
    private readonly goalService;
    constructor(goalService: GoalService);
    private extractUserId;
    create(headers: Record<string, string>, createGoalDto: CreateGoalDto): Promise<{
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
    findAll(headers: Record<string, string>, query: GoalQueryDto): Promise<{
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
    findOne(headers: Record<string, string>, id: string): Promise<{
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
    update(headers: Record<string, string>, id: string, updateGoalDto: UpdateGoalDto): Promise<{
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
    remove(headers: Record<string, string>, id: string): Promise<{
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
    addMilestone(headers: Record<string, string>, id: string, createMilestoneDto: CreateMilestoneDto): Promise<{
        title: string;
        created_at: Date;
        updated_at: Date;
        id: string;
        goal_id: string;
        is_done: boolean;
        due_date: Date | null;
    }>;
    updateMilestone(headers: Record<string, string>, id: string, milestoneId: string, updateMilestoneDto: UpdateMilestoneDto): Promise<{
        title: string;
        created_at: Date;
        updated_at: Date;
        id: string;
        goal_id: string;
        is_done: boolean;
        due_date: Date | null;
    }>;
    removeMilestone(headers: Record<string, string>, id: string, milestoneId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
