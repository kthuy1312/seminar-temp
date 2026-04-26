import { Injectable, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto, CreateMilestoneDto, UpdateMilestoneDto } from './dto';

@Injectable()
export class GoalService {
  private readonly logger = new Logger(GoalService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Create a new goal for the user
   */
  async create(userId: string, createGoalDto: CreateGoalDto) {
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

  /**
   * Get all goals for the user with filtering and pagination
   */
  async findAll(userId: string, query?: { status?: string; category?: string; page?: number; limit?: number; sort_by?: string; sort_order?: 'asc' | 'desc' }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;
    const sort_by = query?.sort_by || 'created_at';
    const sort_order = query?.sort_order || 'desc';

    this.logger.debug(`Fetching goals for user ${userId}: page=${page}, limit=${limit}, sort_by=${sort_by}`);

    const where: any = { user_id: userId };
    if (query?.status) where.status = query.status;
    if (query?.category) where.category = query.category;

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

  /**
   * Get a single goal by ID
   */
  async findOne(userId: string, id: string) {
    this.logger.debug(`Fetching goal ${id} for user ${userId}`);

    const goal = await this.prisma.goal.findUnique({
      where: { id },
      include: { milestones: true },
    });

    if (!goal) {
      this.logger.warn(`Goal ${id} not found`);
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    if (goal.user_id !== userId) {
      this.logger.warn(`User ${userId} tried to access goal ${id} owned by ${goal.user_id}`);
      throw new ForbiddenException('You do not have permission to access this goal');
    }

    return goal;
  }

  /**
   * Update a goal
   */
  async update(userId: string, id: string, updateGoalDto: UpdateGoalDto) {
    this.logger.log(`Updating goal ${id} for user ${userId}`);

    await this.findOne(userId, id); // Ensure it exists and belongs to user

    const data: any = { ...updateGoalDto };
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

  /**
   * Delete a goal
   */
  async remove(userId: string, id: string) {
    this.logger.log(`Deleting goal ${id} for user ${userId}`);

    await this.findOne(userId, id); // Ensure it exists and belongs to user

    const goal = await this.prisma.goal.delete({
      where: { id },
    });

    this.logger.log(`Goal ${id} deleted successfully`);
    return goal;
  }

  /**
   * Add a milestone to a goal
   */
  async addMilestone(userId: string, goalId: string, createMilestoneDto: CreateMilestoneDto) {
    this.logger.log(`Adding milestone to goal ${goalId} for user ${userId}`);

    await this.findOne(userId, goalId); // Validate goal exists and belongs to user

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

  /**
   * Update a milestone
   */
  async updateMilestone(userId: string, goalId: string, milestoneId: string, updateMilestoneDto: UpdateMilestoneDto) {
    this.logger.log(`Updating milestone ${milestoneId} in goal ${goalId} for user ${userId}`);

    await this.findOne(userId, goalId);

    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone || milestone.goal_id !== goalId) {
      this.logger.warn(`Milestone ${milestoneId} not found in goal ${goalId}`);
      throw new NotFoundException(`Milestone with ID ${milestoneId} not found in this goal`);
    }

    const data: any = { ...updateMilestoneDto };
    if (updateMilestoneDto.due_date) {
      data.due_date = new Date(updateMilestoneDto.due_date);
    }

    const updatedMilestone = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data,
    });

    // Auto-calculate goal progress if milestone is marked as done
    if (updateMilestoneDto.is_done !== undefined) {
      await this.recalculateGoalProgress(goalId);
    }

    this.logger.log(`Milestone ${milestoneId} updated successfully`);
    return updatedMilestone;
  }

  /**
   * Delete a milestone
   */
  async removeMilestone(userId: string, goalId: string, milestoneId: string) {
    this.logger.log(`Deleting milestone ${milestoneId} from goal ${goalId} for user ${userId}`);

    await this.findOne(userId, goalId);

    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone || milestone.goal_id !== goalId) {
      this.logger.warn(`Milestone ${milestoneId} not found in goal ${goalId}`);
      throw new NotFoundException(`Milestone with ID ${milestoneId} not found in this goal`);
    }

    await this.prisma.milestone.delete({
      where: { id: milestoneId },
    });

    // Recalculate goal progress
    await this.recalculateGoalProgress(goalId);

    this.logger.log(`Milestone ${milestoneId} deleted successfully`);
    return { success: true, message: 'Milestone deleted successfully' };
  }

  /**
   * Auto-calculate goal progress based on completed milestones
   * Formula: (completed_milestones / total_milestones) * 100
   */
  private async recalculateGoalProgress(goalId: string) {
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
}
