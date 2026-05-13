"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const milestone_response_dto_1 = require("./milestone-response.dto");
class GoalResponseDto {
    id;
    user_id;
    title;
    description;
    category;
    status;
    target_date;
    progress;
    milestones;
    created_at;
    updated_at;
}
exports.GoalResponseDto = GoalResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Goal ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }),
    __metadata("design:type", String)
], GoalResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who owns the goal' }),
    __metadata("design:type", String)
], GoalResponseDto.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Goal title', example: 'Master NestJS' }),
    __metadata("design:type", String)
], GoalResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Goal description', example: 'Complete NestJS course and build 3 projects' }),
    __metadata("design:type", Object)
], GoalResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Goal category', example: 'Backend' }),
    __metadata("design:type", Object)
], GoalResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Goal status',
        enum: ['active', 'completed', 'paused'],
        example: 'active',
    }),
    __metadata("design:type", String)
], GoalResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target date to achieve the goal' }),
    __metadata("design:type", Object)
], GoalResponseDto.prototype, "target_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Progress percentage (0-100)', example: 50 }),
    __metadata("design:type", Number)
], GoalResponseDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [milestone_response_dto_1.MilestoneResponseDto] }),
    __metadata("design:type", Array)
], GoalResponseDto.prototype, "milestones", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the goal was created' }),
    __metadata("design:type", Date)
], GoalResponseDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the goal was last updated' }),
    __metadata("design:type", Date)
], GoalResponseDto.prototype, "updated_at", void 0);
//# sourceMappingURL=goal-response.dto.js.map