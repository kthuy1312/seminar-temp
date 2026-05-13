import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateMilestoneDto } from './create-milestone.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateMilestoneDto extends PartialType(CreateMilestoneDto) {
    @ApiPropertyOptional({
        description: 'Whether the milestone is done',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    is_done?: boolean;
}
