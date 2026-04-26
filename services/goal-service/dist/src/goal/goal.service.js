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
var GoalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GoalService = GoalService_1 = class GoalService {
    prisma;
    logger = new common_1.Logger(GoalService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createGoalDto) {
        this.logger.log(`Creating goal for user ${userId}: ${createGoalDto.title}`);
        const goal = await this.prisma.goal.create({
            data: {
                ...createGoalDto,
                user_id: userId,
                target_date: createGoalDto.target_date ? new Date(createGoalDto.target_date) : null,
            },
            include: { milestones: true },
        });
        this.logger.log(`Goal created successfully: ${goal.id}`);
        return goal;
    }
    async findAll(userId, query) {
        const page = query?.page || 1;
        const limit = query?.limit || 10;
        const skip = (page - 1) * limit;
        const sort_by = query?.sort_by || 'created_at';
        const sort_order = query?.sort_order || 'desc';
        this.logger.debug(`Fetching goals for user ${userId}: page=${page}, limit=${limit}, sort_by=${sort_by}`);
        const where = { user_id: userId };
        if (query?.status)
            where.status = query.status;
        if (query?.category)
            where.category = query.category;
        const [goals, total] = await Promise.all([
            this.prisma.goal.findMany({
                where,
                include: { milestones: true },
                orderBy: { [sort_by]: sort_order },
                skip,
                take: limit,
            }),
            this.prisma.goal.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: goals,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
    async findOne(userId, id) {
        this.logger.debug(`Fetching goal ${id} for user ${userId}`);
        const goal = await this.prisma.goal.findUnique({
            where: { id },
            include: { milestones: true },
        });
        if (!goal) {
            this.logger.warn(`Goal ${id} not found`);
            throw new common_1.NotFoundException(`Goal with ID ${id} not found`);
        }
        if (goal.user_id !== userId) {
            this.logger.warn(`User ${userId} tried to access goal ${id} owned by ${goal.user_id}`);
            throw new common_1.ForbiddenException('You do not have permission to access this goal');
        }
        return goal;
    }
    async update(userId, id, updateGoalDto) {
        this.logger.log(`Updating goal ${id} for user ${userId}`);
        await this.findOne(userId, id);
        const data = { ...updateGoalDto };
        if (updateGoalDto.target_date) {
            data.target_date = new Date(updateGoalDto.target_date);
        }
        const goal = await this.prisma.goal.update({
            where: { id },
            data,
            include: { milestones: true },
        });
        this.logger.log(`Goal ${id} updated successfully`);
        return goal;
    }
    async remove(userId, id) {
        this.logger.log(`Deleting goal ${id} for user ${userId}`);
        await this.findOne(userId, id);
        const goal = await this.prisma.goal.delete({
            where: { id },
        });
        this.logger.log(`Goal ${id} deleted successfully`);
        return goal;
    }
    async addMilestone(userId, goalId, createMilestoneDto) {
        this.logger.log(`Adding milestone to goal ${goalId} for user ${userId}`);
        await this.findOne(userId, goalId);
        const milestone = await this.prisma.milestone.create({
            data: {
                ...createMilestoneDto,
                goal_id: goalId,
                due_date: createMilestoneDto.due_date ? new Date(createMilestoneDto.due_date) : null,
            },
        });
        this.logger.log(`Milestone ${milestone.id} created successfully`);
        return milestone;
    }
    async updateMilestone(userId, goalId, milestoneId, updateMilestoneDto) {
        this.logger.log(`Updating milestone ${milestoneId} in goal ${goalId} for user ${userId}`);
        await this.findOne(userId, goalId);
        const milestone = await this.prisma.milestone.findUnique({
            where: { id: milestoneId },
        });
        if (!milestone || milestone.goal_id !== goalId) {
            this.logger.warn(`Milestone ${milestoneId} not found in goal ${goalId}`);
            throw new common_1.NotFoundException(`Milestone with ID ${milestoneId} not found in this goal`);
        }
        const data = { ...updateMilestoneDto };
        if (updateMilestoneDto.due_date) {
            data.due_date = new Date(updateMilestoneDto.due_date);
        }
        const updatedMilestone = await this.prisma.milestone.update({
            where: { id: milestoneId },
            data,
        });
        if (updateMilestoneDto.is_done !== undefined) {
            await this.recalculateGoalProgress(goalId);
        }
        this.logger.log(`Milestone ${milestoneId} updated successfully`);
        return updatedMilestone;
    }
    async removeMilestone(userId, goalId, milestoneId) {
        this.logger.log(`Deleting milestone ${milestoneId} from goal ${goalId} for user ${userId}`);
        await this.findOne(userId, goalId);
        const milestone = await this.prisma.milestone.findUnique({
            where: { id: milestoneId },
        });
        if (!milestone || milestone.goal_id !== goalId) {
            this.logger.warn(`Milestone ${milestoneId} not found in goal ${goalId}`);
            throw new common_1.NotFoundException(`Milestone with ID ${milestoneId} not found in this goal`);
        }
        await this.prisma.milestone.delete({
            where: { id: milestoneId },
        });
        await this.recalculateGoalProgress(goalId);
        this.logger.log(`Milestone ${milestoneId} deleted successfully`);
        return { success: true, message: 'Milestone deleted successfully' };
    }
    async recalculateGoalProgress(goalId) {
        this.logger.debug(`Recalculating progress for goal ${goalId}`);
        const goal = await this.prisma.goal.findUnique({
            where: { id: goalId },
            include: { milestones: true },
        });
        if (!goal) {
            this.logger.warn(`Goal ${goalId} not found for progress recalculation`);
            return;
        }
        if (goal.milestones.length === 0) {
            this.logger.debug(`Goal ${goalId} has no milestones, progress remains unchanged`);
            return;
        }
        const completedCount = goal.milestones.filter((m) => m.is_done).length;
        const newProgress = Math.round((completedCount / goal.milestones.length) * 100);
        const newStatus = newProgress === 100 ? 'completed' : goal.status;
        await this.prisma.goal.update({
            where: { id: goalId },
            data: {
                progress: newProgress,
                status: newStatus,
            },
        });
        this.logger.debug(`Goal ${goalId} progress updated to ${newProgress}% (${completedCount}/${goal.milestones.length} milestones done), status: ${newStatus}`);
    }
};
exports.GoalService = GoalService;
exports.GoalService = GoalService = GoalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoalService);
//# sourceMappingURL=goal.service.js.map