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
exports.UpdateGoalDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_goal_dto_1 = require("./create-goal.dto");
const class_validator_1 = require("class-validator");
class UpdateGoalDto extends (0, swagger_1.PartialType)(create_goal_dto_1.CreateGoalDto) {
    status;
    progress;
}
exports.UpdateGoalDto = UpdateGoalDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Status of the goal',
        enum: ['active', 'completed', 'paused'],
        example: 'active',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['active', 'completed', 'paused']),
    __metadata("design:type", String)
], UpdateGoalDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Progress percentage (0-100)',
        example: 50,
        minimum: 0,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateGoalDto.prototype, "progress", void 0);
//# sourceMappingURL=update-goal.dto.js.map