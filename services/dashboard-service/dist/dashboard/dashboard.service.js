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
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const dashboard_actions_1 = require("./constants/dashboard-actions");
let DashboardService = DashboardService_1 = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DashboardService_1.name);
    }
    async getStats(userId) {
        if (userId) {
            return this.ensureUserStats(userId);
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
        };
    }
    async getActivity(query) {
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
            data: items,
            pagination: {
                total,
                limit: query.limit,
                offset: query.offset,
            },
        };
    }
    async getProgress(query) {
        const dayRange = query.period === '7d' ? 7 : query.period === '90d' ? 90 : 30;
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
        const progressByDay = new Map();
        for (const log of logs) {
            const dateKey = log.createdAt.toISOString().slice(0, 10);
            const current = progressByDay.get(dateKey) ?? {
                completedGoals: 0,
                quizzes: 0,
                docs: 0,
            };
            if (log.action === dashboard_actions_1.DASHBOARD_ACTIONS.GOAL_COMPLETED) {
                current.completedGoals += 1;
            }
            else if (log.action === dashboard_actions_1.DASHBOARD_ACTIONS.QUIZ_COMPLETED) {
                current.quizzes += 1;
            }
            else if (log.action === dashboard_actions_1.DASHBOARD_ACTIONS.DOCUMENT_UPLOADED) {
                current.docs += 1;
            }
            progressByDay.set(dateKey, current);
        }
        return Array.from(progressByDay.entries()).map(([date, metrics]) => ({
            date,
            ...metrics,
        }));
    }
    async handleUserCreated(payload) {
        const occurredAt = this.resolveOccurredAt(payload.occurred_at);
        await this.prisma.$transaction(async (tx) => {
            await this.ensureUserStats(payload.user_id, tx);
            await this.createActivity(tx, payload.user_id, dashboard_actions_1.DASHBOARD_ACTIONS.USER_CREATED, this.toJson(payload), occurredAt);
        });
    }
    async handleGoalCreated(payload) {
        const occurredAt = this.resolveOccurredAt(payload.occurred_at);
        await this.prisma.$transaction(async (tx) => {
            const stats = await this.ensureUserStats(payload.user_id, tx);
            await tx.userStats.update({
                where: { userId: payload.user_id },
                data: {
                    totalGoals: stats.totalGoals + 1,
                    lastActive: occurredAt,
                },
            });
            await this.createActivity(tx, payload.user_id, dashboard_actions_1.DASHBOARD_ACTIONS.GOAL_CREATED, this.toJson(payload), occurredAt);
        });
    }
    async handleGoalCompleted(payload) {
        const occurredAt = this.resolveOccurredAt(payload.occurred_at);
        await this.prisma.$transaction(async (tx) => {
            const stats = await this.ensureUserStats(payload.user_id, tx);
            await tx.userStats.update({
                where: { userId: payload.user_id },
                data: {
                    completedGoals: stats.completedGoals + 1,
                    lastActive: occurredAt,
                },
            });
            await this.createActivity(tx, payload.user_id, dashboard_actions_1.DASHBOARD_ACTIONS.GOAL_COMPLETED, this.toJson(payload), occurredAt);
        });
    }
    async handleDocumentUploaded(payload) {
        const occurredAt = this.resolveOccurredAt(payload.occurred_at);
        await this.prisma.$transaction(async (tx) => {
            const stats = await this.ensureUserStats(payload.user_id, tx);
            await tx.userStats.update({
                where: { userId: payload.user_id },
                data: {
                    totalDocuments: stats.totalDocuments + 1,
                    lastActive: occurredAt,
                },
            });
            await this.createActivity(tx, payload.user_id, dashboard_actions_1.DASHBOARD_ACTIONS.DOCUMENT_UPLOADED, this.toJson(payload), occurredAt);
        });
    }
    async handleQuizCompleted(payload) {
        const occurredAt = this.resolveOccurredAt(payload.occurred_at);
        await this.prisma.$transaction(async (tx) => {
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
            await this.createActivity(tx, payload.user_id, dashboard_actions_1.DASHBOARD_ACTIONS.QUIZ_COMPLETED, this.toJson(payload), occurredAt);
            this.logger.log(`Quiz completed aggregated for user ${payload.user_id}, quiz ${payload.quiz_id}`);
        });
    }
    async handleRoadmapStepCompleted(payload) {
        const occurredAt = this.resolveOccurredAt(payload.occurred_at);
        await this.prisma.$transaction(async (tx) => {
            await this.ensureUserStats(payload.user_id, tx);
            await tx.userStats.update({
                where: { userId: payload.user_id },
                data: {
                    lastActive: occurredAt,
                },
            });
            await this.createActivity(tx, payload.user_id, dashboard_actions_1.DASHBOARD_ACTIONS.ROADMAP_STEP_COMPLETED, this.toJson(payload), occurredAt);
        });
    }
    async handleSummaryCreated(payload) {
        const occurredAt = this.resolveOccurredAt(payload.occurred_at);
        await this.prisma.$transaction(async (tx) => {
            await this.ensureUserStats(payload.user_id, tx);
            await this.createActivity(tx, payload.user_id, dashboard_actions_1.DASHBOARD_ACTIONS.SUMMARY_CREATED, this.toJson(payload), occurredAt);
        });
    }
    async ensureUserStats(userId, tx = this.prisma) {
        return tx.userStats.upsert({
            where: { userId },
            create: {
                userId,
            },
            update: {},
        });
    }
    async createActivity(tx, userId, action, metadata, createdAt) {
        await tx.activityLog.create({
            data: {
                userId,
                action,
                metadata,
                createdAt,
            },
        });
    }
    async calculateStudyStreak(userId, tx) {
        const activities = await tx.activityLog.findMany({
            where: { userId },
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 365,
        });
        if (activities.length === 0)
            return 0;
        const uniqueDays = new Set(activities.map((it) => it.createdAt.toISOString().slice(0, 10)));
        const today = new Date();
        let streak = 0;
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dayKey = d.toISOString().slice(0, 10);
            if (uniqueDays.has(dayKey)) {
                streak += 1;
            }
            else {
                break;
            }
        }
        return streak;
    }
    resolveOccurredAt(occurredAt) {
        if (!occurredAt)
            return new Date();
        const parsed = new Date(occurredAt);
        return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    toJson(payload) {
        return JSON.parse(JSON.stringify(payload));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map