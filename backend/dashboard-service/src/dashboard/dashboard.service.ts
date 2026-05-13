import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DASHBOARD_ACTIONS } from './constants/dashboard-actions';
import { GetActivityQueryDto } from './dto/get-activity-query.dto';
import { GetProgressQueryDto } from './dto/get-progress-query.dto';
import { DocumentUploadedEventDto } from './dto/events/document-uploaded-event.dto';
import { GoalCompletedEventDto } from './dto/events/goal-completed-event.dto';
import { GoalCreatedEventDto } from './dto/events/goal-created-event.dto';
import { QuizCompletedEventDto } from './dto/events/quiz-completed-event.dto';
import { RoadmapStepCompletedEventDto } from './dto/events/roadmap-step-completed-event.dto';
import { SummaryCreatedEventDto } from './dto/events/summary-created-event.dto';
import { UserCreatedEventDto } from './dto/events/user-created-event.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId?: string) {
    if (userId) {
      const stats = await this.ensureUserStats(userId);
      return { success: true, data: stats };
    }

    const [totalUsers, totals] = await Promise.all([
      this.prisma.userStats.count(),
      this.prisma.userStats.aggregate({
        _sum: {
          totalGoals: true,
          completedGoals: true,
          totalDocuments: true,
          totalQuizzes: true,
        },
        _avg: {
          avgQuizScore: true,
          studyStreak: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        totals: {
          totalGoals: totals._sum.totalGoals ?? 0,
          completedGoals: totals._sum.completedGoals ?? 0,
          totalDocuments: totals._sum.totalDocuments ?? 0,
          totalQuizzes: totals._sum.totalQuizzes ?? 0,
        },
        averages: {
          avgQuizScore: Number(totals._avg.avgQuizScore ?? 0),
          avgStudyStreak: Number(totals._avg.studyStreak ?? 0),
        },
      },
    };
  }

  async getActivity(query: GetActivityQueryDto) {
    const where = query.userId ? { userId: query.userId } : {};

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      success: true,
      data: items,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
      },
    };
  }

  async getProgress(query: GetProgressQueryDto) {
    const dayRange =
      query.period === '7d' ? 7 : query.period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dayRange);

    const where = {
      createdAt: {
        gte: startDate,
      },
      ...(query.userId ? { userId: query.userId } : {}),
    };

    const logs = await this.prisma.activityLog.findMany({
      where,
      select: {
        action: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const progressByDay = new Map<
      string,
      { completedGoals: number; quizzes: number; docs: number }
    >();

    for (const log of logs) {
      const dateKey = log.createdAt.toISOString().slice(0, 10);
      const current = progressByDay.get(dateKey) ?? {
        completedGoals: 0,
        quizzes: 0,
        docs: 0,
      };

      if (log.action === DASHBOARD_ACTIONS.GOAL_COMPLETED) {
        current.completedGoals += 1;
      } else if (log.action === DASHBOARD_ACTIONS.QUIZ_COMPLETED) {
        current.quizzes += 1;
      } else if (log.action === DASHBOARD_ACTIONS.DOCUMENT_UPLOADED) {
        current.docs += 1;
      }
      progressByDay.set(dateKey, current);
    }

    return {
      success: true,
      data: Array.from(progressByDay.entries()).map(([date, metrics]) => ({
        date,
        ...metrics,
      })),
    };
  }

  async handleUserCreated(payload: UserCreatedEventDto) {
    const occurredAt = this.resolveOccurredAt(payload.occurred_at);
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await this.ensureUserStats(payload.user_id, tx);
      await this.createActivity(
        tx,
        payload.user_id,
        DASHBOARD_ACTIONS.USER_CREATED,
        this.toJson(payload),
        occurredAt,
      );
    });
  }

  async handleGoalCreated(payload: GoalCreatedEventDto) {
    const occurredAt = this.resolveOccurredAt(payload.occurred_at);
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const stats = await this.ensureUserStats(payload.user_id, tx);
      await tx.userStats.update({
        where: { userId: payload.user_id },
        data: {
          totalGoals: stats.totalGoals + 1,
          lastActive: occurredAt,
        },
      });
      await this.createActivity(
        tx,
        payload.user_id,
        DASHBOARD_ACTIONS.GOAL_CREATED,
        this.toJson(payload),
        occurredAt,
      );
    });
  }

  async handleGoalCompleted(payload: GoalCompletedEventDto) {
    const occurredAt = this.resolveOccurredAt(payload.occurred_at);
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const stats = await this.ensureUserStats(payload.user_id, tx);
      await tx.userStats.update({
        where: { userId: payload.user_id },
        data: {
          completedGoals: stats.completedGoals + 1,
          lastActive: occurredAt,
        },
      });
      await this.createActivity(
        tx,
        payload.user_id,
        DASHBOARD_ACTIONS.GOAL_COMPLETED,
        this.toJson(payload),
        occurredAt,
      );
    });
  }

  async handleDocumentUploaded(payload: DocumentUploadedEventDto) {
    const occurredAt = this.resolveOccurredAt(payload.occurred_at);
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const stats = await this.ensureUserStats(payload.user_id, tx);
      await tx.userStats.update({
        where: { userId: payload.user_id },
        data: {
          totalDocuments: stats.totalDocuments + 1,
          lastActive: occurredAt,
        },
      });
      await this.createActivity(
        tx,
        payload.user_id,
        DASHBOARD_ACTIONS.DOCUMENT_UPLOADED,
        this.toJson(payload),
        occurredAt,
      );
    });
  }

  async handleQuizCompleted(payload: QuizCompletedEventDto) {
    const occurredAt = this.resolveOccurredAt(payload.occurred_at);
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const stats = await this.ensureUserStats(payload.user_id, tx);
      await tx.quizMetric.upsert({
        where: { quizId: payload.quiz_id },
        create: {
          userId: payload.user_id,
          quizId: payload.quiz_id,
          score: payload.score,
          createdAt: occurredAt,
        },
        update: {
          score: payload.score,
          createdAt: occurredAt,
        },
      });

      const aggregate = await tx.quizMetric.aggregate({
        where: { userId: payload.user_id },
        _count: { id: true },
        _avg: { score: true },
      });

      await tx.userStats.update({
        where: { userId: payload.user_id },
        data: {
          totalQuizzes: aggregate._count.id,
          avgQuizScore: aggregate._avg.score ?? 0,
          studyStreak: await this.calculateStudyStreak(payload.user_id, tx),
          lastActive: occurredAt,
        },
      });

      await this.createActivity(
        tx,
        payload.user_id,
        DASHBOARD_ACTIONS.QUIZ_COMPLETED,
        this.toJson(payload),
        occurredAt,
      );
      this.logger.log(
        `Quiz completed aggregated for user ${payload.user_id}, quiz ${payload.quiz_id}`,
      );
      this.logger.debug(`Previous total quizzes: ${stats.totalQuizzes}`);
    });
  }

  async handleRoadmapStepCompleted(payload: RoadmapStepCompletedEventDto) {
    const occurredAt = this.resolveOccurredAt(payload.occurred_at);
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await this.ensureUserStats(payload.user_id, tx);
      await tx.userStats.update({
        where: { userId: payload.user_id },
        data: {
          lastActive: occurredAt,
        },
      });
      await this.createActivity(
        tx,
        payload.user_id,
        DASHBOARD_ACTIONS.ROADMAP_STEP_COMPLETED,
        this.toJson(payload),
        occurredAt,
      );
    });
  }

  async handleSummaryCreated(payload: SummaryCreatedEventDto) {
    const occurredAt = this.resolveOccurredAt(payload.occurred_at);
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await this.ensureUserStats(payload.user_id, tx);
      await this.createActivity(
        tx,
        payload.user_id,
        DASHBOARD_ACTIONS.SUMMARY_CREATED,
        this.toJson(payload),
        occurredAt,
      );
    });
  }

  private async ensureUserStats(
    userId: string,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    return tx.userStats.upsert({
      where: { userId },
      create: {
        userId,
      },
      update: {},
    });
  }

  private async createActivity(
    tx: Prisma.TransactionClient,
    userId: string,
    action: string,
    metadata: Prisma.InputJsonObject,
    createdAt: Date,
  ) {
    await tx.activityLog.create({
      data: {
        userId,
        action,
        metadata,
        createdAt,
      },
    });
  }

  private async calculateStudyStreak(
    userId: string,
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    const activities = await tx.activityLog.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 365,
    });

    if (activities.length === 0) return 0;

    const uniqueDays = new Set(
      activities.map((it: { createdAt: Date }) =>
        it.createdAt.toISOString().slice(0, 10),
      ),
    );
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10);
      if (uniqueDays.has(dayKey)) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  }

  private resolveOccurredAt(occurredAt?: string) {
    if (!occurredAt) return new Date();
    const parsed = new Date(occurredAt);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private toJson(
    payload: object,
  ): Prisma.InputJsonObject {
    return JSON.parse(
      JSON.stringify(payload),
    ) as Prisma.InputJsonObject;
  }
}
