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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalController = void 0;
const common_1 = require("@nestjs/common");
const goal_service_1 = require("./goal.service");
const dto_1 = require("./dto");
const swagger_1 = require("@nestjs/swagger");
let GoalController = class GoalController {
    goalService;
    constructor(goalService) {
        this.goalService = goalService;
    }
    extractUserId(headers) {
        const userId = headers['x-user-id'];
        if (!userId) {
            throw new common_1.UnauthorizedException('x-user-id header is missing');
        }
        return userId;
    }
    async create(headers, createGoalDto) {
        const userId = this.extractUserId(headers);
        return this.goalService.create(userId, createGoalDto);
    }
    async findAll(headers, query) {
        const userId = this.extractUserId(headers);
        return this.goalService.findAll(userId, query);
    }
    async findOne(headers, id) {
        const userId = this.extractUserId(headers);
        return this.goalService.findOne(userId, id);
    }
    async update(headers, id, updateGoalDto) {
        const userId = this.extractUserId(headers);
        return this.goalService.update(userId, id, updateGoalDto);
    }
    async remove(headers, id) {
        const userId = this.extractUserId(headers);
        return this.goalService.remove(userId, id);
    }
    async addMilestone(headers, id, createMilestoneDto) {
        const userId = this.extractUserId(headers);
        return this.goalService.addMilestone(userId, id, createMilestoneDto);
    }
    async updateMilestone(headers, id, milestoneId, updateMilestoneDto) {
        const userId = this.extractUserId(headers);
        return this.goalService.updateMilestone(userId, id, milestoneId, updateMilestoneDto);
    }
    async removeMilestone(headers, id, milestoneId) {
        const userId = this.extractUserId(headers);
        return this.goalService.removeMilestone(userId, id, milestoneId);
    }
};
exports.GoalController = GoalController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new learning goal' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Goal created successfully',
        type: dto_1.GoalResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing x-user-id header' }),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateGoalDto]),
    __metadata("design:returntype", Promise)
], GoalController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all goals for the authenticated user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of goals with pagination',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing x-user-id header' }),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.GoalQueryDto]),
    __metadata("design:returntype", Promise)
], GoalController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific goal by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Goal details with milestones',
        type: dto_1.GoalResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Goal not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing x-user-id header' }),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GoalController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update a goal' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Goal updated successfully',
        type: dto_1.GoalResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Goal not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing x-user-id header' }),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateGoalDto]),
    __metadata("design:returntype", Promise)
], GoalController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a goal' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Goal deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Goal not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing x-user-id header' }),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GoalController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/milestones'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add a milestone to a goal' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Milestone added successfully',
        type: dto_1.MilestoneResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Goal not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing x-user-id header' }),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.CreateMilestoneDto]),
    __metadata("design:returntype", Promise)
], GoalController.prototype, "addMilestone", null);
__decorate([
    (0, common_1.Put)(':id/milestones/:milestoneId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update a milestone' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Milestone updated successfully',
        type: dto_1.MilestoneResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Milestone not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing x-user-id header' }),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('milestoneId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, dto_1.UpdateMilestoneDto]),
    __metadata("design:returntype", Promise)
], GoalController.prototype, "updateMilestone", null);
__decorate([
    (0, common_1.Delete)(':id/milestones/:milestoneId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a milestone' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Milestone deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Milestone not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing x-user-id header' }),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('milestoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GoalController.prototype, "removeMilestone", null);
exports.GoalController = GoalController = __decorate([
    (0, swagger_1.ApiTags)('goals'),
    (0, swagger_1.ApiHeader)({
        name: 'x-user-id',
        description: 'The user ID from API Gateway',
        required: true,
    }),
    (0, common_1.Controller)('api/goals'),
    __metadata("design:paramtypes", [goal_service_1.GoalService])
], GoalController);
//# sourceMappingURL=goal.controller.js.map