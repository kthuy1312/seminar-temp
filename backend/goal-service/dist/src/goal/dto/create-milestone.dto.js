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
exports.CreateMilestoneDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateMilestoneDto {
    title;
    due_date;
}
exports.CreateMilestoneDto = CreateMilestoneDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The title of the milestone',
        example: 'Finish NestJS crash course',
        minLength: 3,
        maxLength: 255,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 255, { message: 'Milestone title must be between 3 and 255 characters' }),
    __metadata("design:type", String)
], CreateMilestoneDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Due date for the milestone (ISO 8601 format: YYYY-MM-DD)',
        example: '2026-06-30',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({ strict: true }, { message: 'Due date must be in ISO 8601 format (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], CreateMilestoneDto.prototype, "due_date", void 0);
//# sourceMappingURL=create-milestone.dto.js.map