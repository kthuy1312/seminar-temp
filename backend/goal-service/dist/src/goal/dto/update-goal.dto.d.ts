import { CreateGoalDto } from './create-goal.dto';
declare const UpdateGoalDto_base: import("@nestjs/common").Type<Partial<CreateGoalDto>>;
export declare class UpdateGoalDto extends UpdateGoalDto_base {
    status?: string;
    progress?: number;
}
export {};
