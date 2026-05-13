import { CreateMilestoneDto } from './create-milestone.dto';
declare const UpdateMilestoneDto_base: import("@nestjs/common").Type<Partial<CreateMilestoneDto>>;
export declare class UpdateMilestoneDto extends UpdateMilestoneDto_base {
    is_done?: boolean;
}
export {};
