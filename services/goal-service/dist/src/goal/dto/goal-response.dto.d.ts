import { MilestoneResponseDto } from './milestone-response.dto';
export declare class GoalResponseDto {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    category: string | null;
    status: string;
    target_date: Date | null;
    progress: number;
    milestones: MilestoneResponseDto[];
    created_at: Date;
    updated_at: Date;
}
