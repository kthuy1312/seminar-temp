import { DashboardService } from './dashboard.service';
import { DASHBOARD_ACTIONS } from './constants/dashboard-actions';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      userStats: {
        count: jest.fn(),
        aggregate: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      activityLog: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
      quizMetric: {
        upsert: jest.fn(),
        aggregate: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));
    service = new DashboardService(prisma);
  });

  describe('getStats', () => {
    it('returns system aggregated stats when userId is missing', async () => {
      prisma.userStats.count.mockResolvedValue(2);
      prisma.userStats.aggregate.mockResolvedValue({
        _sum: {
          totalGoals: 5,
          completedGoals: 3,
          totalDocuments: 4,
          totalQuizzes: 7,
        },
        _avg: {
          avgQuizScore: 82.5,
          studyStreak: 6,
        },
      });

      const result = await service.getStats();

      expect(result).toEqual({
        success: true,
        data: {
          totalUsers: 2,
          totals: {
            totalGoals: 5,
            completedGoals: 3,
            totalDocuments: 4,
            totalQuizzes: 7,
          },
          averages: {
            avgQuizScore: 82.5,
            avgStudyStreak: 6,
          },
        },
      });
    });

    it('returns stats for a specific user', async () => {
      const userStats = {
        id: 'stats-id',
        userId: 'u1',
        totalGoals: 1,
        completedGoals: 0,
      };
      prisma.userStats.upsert.mockResolvedValue(userStats);

      const result = await service.getStats('u1');

      expect(prisma.userStats.upsert).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        create: { userId: 'u1' },
        update: {},
      });
      expect(result).toEqual({ success: true, data: userStats });
    });
  });

  describe('getActivity', () => {
    it('returns paginated activity logs', async () => {
      const items = [{ id: 'a1', userId: 'u1' }, { id: 'a2', userId: 'u1' }];
      prisma.activityLog.findMany.mockResolvedValue(items);
      prisma.activityLog.count.mockResolvedValue(2);

      const result = await service.getActivity({
        userId: 'u1',
        limit: 20,
        offset: 0,
      });

      expect(prisma.activityLog.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
      });
      expect(result.pagination.total).toBe(2);
      expect(result.data).toEqual(items);
    });
  });

  describe('getProgress', () => {
    it('aggregates progress by day and action', async () => {
      prisma.activityLog.findMany.mockResolvedValue([
        {
          action: DASHBOARD_ACTIONS.GOAL_COMPLETED,
          createdAt: new Date('2026-04-20T01:00:00.000Z'),
        },
        {
          action: DASHBOARD_ACTIONS.QUIZ_COMPLETED,
          createdAt: new Date('2026-04-20T02:00:00.000Z'),
        },
        {
          action: DASHBOARD_ACTIONS.DOCUMENT_UPLOADED,
          createdAt: new Date('2026-04-21T02:00:00.000Z'),
        },
      ]);

      const result = await service.getProgress({
        userId: 'u1',
        period: '30d',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        { date: '2026-04-20', completedGoals: 1, quizzes: 1, docs: 0 },
        { date: '2026-04-21', completedGoals: 0, quizzes: 0, docs: 1 },
      ]);
    });
  });

  describe('event handlers', () => {
    it('handleGoalCreated increments totalGoals and logs activity', async () => {
      prisma.userStats.upsert.mockResolvedValue({
        userId: 'u1',
        totalGoals: 2,
      });
      prisma.userStats.update.mockResolvedValue({});
      prisma.activityLog.create.mockResolvedValue({});

      await service.handleGoalCreated({
        user_id: 'u1',
        goal_id: 'g1',
        occurred_at: '2026-04-20T00:00:00.000Z',
      });

      expect(prisma.userStats.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1' },
          data: expect.objectContaining({ totalGoals: 3 }),
        }),
      );
      expect(prisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'u1',
            action: DASHBOARD_ACTIONS.GOAL_CREATED,
          }),
        }),
      );
    });

    it('handleQuizCompleted updates quiz metrics and user stats', async () => {
      prisma.userStats.upsert.mockResolvedValue({
        userId: 'u1',
        totalQuizzes: 3,
      });
      prisma.quizMetric.upsert.mockResolvedValue({});
      prisma.quizMetric.aggregate.mockResolvedValue({
        _count: { id: 4 },
        _avg: { score: 88.5 },
      });
      prisma.activityLog.findMany.mockResolvedValue([
        { createdAt: new Date() },
      ]);
      prisma.userStats.update.mockResolvedValue({});
      prisma.activityLog.create.mockResolvedValue({});

      await service.handleQuizCompleted({
        user_id: 'u1',
        quiz_id: 'q1',
        score: 90,
        occurred_at: '2026-04-20T00:00:00.000Z',
      });

      expect(prisma.quizMetric.upsert).toHaveBeenCalled();
      expect(prisma.userStats.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1' },
          data: expect.objectContaining({
            totalQuizzes: 4,
            avgQuizScore: 88.5,
          }),
        }),
      );
      expect(prisma.activityLog.create).toHaveBeenCalled();
    });
  });
});
