import { ApiProperty } from '@nestjs/swagger';

export class MilestoneResponseDto {
    @ApiProperty({ description: 'Milestone ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
    id: string;

    @ApiProperty({ description: 'Goal ID that this milestone belongs to' })
    goal_id: string;

    @ApiProperty({ description: 'Milestone title', example: 'Finish NestJS crash course' })
    title: string;

    @ApiProperty({ description: 'Whether the milestone is done', example: false })
    is_done: boolean;

    @ApiProperty({ description: 'Due date for the milestone', required: false })
    due_date: Date | null;

    @ApiProperty({ description: 'When the milestone was created' })
    created_at: Date;

    @ApiProperty({ description: 'When the milestone was last updated' })
    updated_at: Date;
}
