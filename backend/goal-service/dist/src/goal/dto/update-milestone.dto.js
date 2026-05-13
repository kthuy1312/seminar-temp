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
exports.UpdateMilestoneDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_milestone_dto_1 = require("./create-milestone.dto");
const class_validator_1 = require("class-validator");
class UpdateMilestoneDto extends (0, swagger_1.PartialType)(create_milestone_dto_1.CreateMilestoneDto) {
    is_done;
}
exports.UpdateMilestoneDto = UpdateMilestoneDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the milestone is done',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMilestoneDto.prototype, "is_done", void 0);
//# sourceMappingURL=update-milestone.dto.js.map