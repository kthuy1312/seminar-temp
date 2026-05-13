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
exports.MilestoneResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class MilestoneResponseDto {
    id;
    goal_id;
    title;
    is_done;
    due_date;
    created_at;
    updated_at;
}
exports.MilestoneResponseDto = MilestoneResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Milestone ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }),
    __metadata("design:type", String)
], MilestoneResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Goal ID that this milestone belongs to' }),
    __metadata("design:type", String)
], MilestoneResponseDto.prototype, "goal_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Milestone title', example: 'Finish NestJS crash course' }),
    __metadata("design:type", String)
], MilestoneResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the milestone is done', example: false }),
    __metadata("design:type", Boolean)
], MilestoneResponseDto.prototype, "is_done", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Due date for the milestone', required: false }),
    __metadata("design:type", Object)
], MilestoneResponseDto.prototype, "due_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the milestone was created' }),
    __metadata("design:type", Date)
], MilestoneResponseDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the milestone was last updated' }),
    __metadata("design:type", Date)
], MilestoneResponseDto.prototype, "updated_at", void 0);
//# sourceMappingURL=milestone-response.dto.js.map