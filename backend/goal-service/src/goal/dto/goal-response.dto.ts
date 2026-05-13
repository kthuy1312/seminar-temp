import { ApiProperty } from '@nestjs/swagger';
import { MilestoneResponseDto } from './milestone-response.dto';

export class GoalResponseDto {
    @ApiProperty({ description: 'Goal ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
    id: string;

    @ApiProperty({ description: 'User ID who owns the goal' })
    user_id: string;

    @ApiProperty({ description: 'Goal title', example: 'Master NestJS' })
    title: string;

    @ApiProperty({ description: 'Goal description', example: 'Complete NestJS course and build 3 projects' })
    description: string | null;

    @ApiProperty({ description: 'Goal category', example: 'Backend' })
    category: string | null;

    @ApiProperty({
        description: 'Goal status',
        enum: ['active', 'completed', 'paused'],
        example: 'active',
    })
    status: string;

    @ApiProperty({ description: 'Target date to achieve the goal' })
    target_date: Date | null;

    @ApiProperty({ description: 'Progress percentage (0-100)', example: 50 })
    progress: number;

    @ApiProperty({ type: [MilestoneResponseDto] })
    milestones: MilestoneResponseDto[];

    @ApiProperty({ description: 'When the goal was created' })
    created_at: Date;

    @ApiProperty({ description: 'When the goal was last updated' })
    updated_at: Date;
}
