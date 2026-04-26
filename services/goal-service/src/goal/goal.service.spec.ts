import { Test, TestingModule } from '@nestjs/testing';
import { GoalService } from './goal.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('GoalService', () => {
    let service: GoalService;
    let prismaService: PrismaService;

    const mockGoal = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: 'user-123',
        title: 'Learn NestJS',
        description: 'Master NestJS framework',
        category: 'Backend',
        status: 'active',
        target_date: new Date('2026-12-31'),
        progress: 0,
        created_at: new Date(),
        updated_at: new Date(),
        milestones: [],
    };

    const mockMilestone = {
        id: 'milestone-123',
        goal_id: mockGoal.id,
        title: 'Complete basics',
        is_done: false,
        due_date: new Date('2026-06-30'),
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GoalService,
                {
                    provide: PrismaService,
                    useValue: {
                        goal: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                            count: jest.fn(),
                        },
                        milestone: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<GoalService>(GoalService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    describe('create', () => {
        it('should create a goal successfully', async () => {
            const createGoalDto = {
                title: 'Learn NestJS',
                description: 'Master NestJS framework',
                category: 'Backend',
                target_date: '2026-12-31',
            };

            jest.spyOn(prismaService.goal, 'create').mockResolvedValue({
                ...mockGoal,
                ...createGoalDto,
                target_date: createGoalDto.target_date ? new Date(createGoalDto.target_date) : null,
                milestones: [],
            } as any); // Dùng 'as any' để bỏ qua kiểm tra phức tạp của Prisma__GoalClient trong test

            const result = await service.create(mockGoal.user_id, createGoalDto);

            expect(result).toEqual(expect.objectContaining({
                title: 'Learn NestJS',
                user_id: 'user-123',
            }));
            expect(prismaService.goal.create).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return paginated goals', async () => {
            const mockGoals = [mockGoal];
            jest.spyOn(prismaService.goal, 'findMany').mockResolvedValue(mockGoals);
            jest.spyOn(prismaService.goal, 'count').mockResolvedValue(1);

            const result = await service.findAll(mockGoal.user_id, {
                page: 1,
                limit: 10,
            });

            expect(result.data).toEqual(mockGoals);
            expect(result.pagination.total).toBe(1);
            expect(result.pagination.page).toBe(1);
        });
    });

    describe('findOne', () => {
        it('should return a goal when found', async () => {
            jest.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoal);

            const result = await service.findOne(mockGoal.user_id, mockGoal.id);

            expect(result).toEqual(mockGoal);
        });

        it('should throw NotFoundException when goal not found', async () => {
            jest.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(null);

            await expect(service.findOne(mockGoal.user_id, 'invalid-id')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw ForbiddenException when user does not own goal', async () => {
            jest.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoal);

            await expect(service.findOne('different-user', mockGoal.id)).rejects.toThrow(
                ForbiddenException,
            );
        });
    });

    describe('update', () => {
        it('should update a goal successfully', async () => {
            const updateGoalDto = {
                progress: 50,
                status: 'in_progress',
            };

            jest.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoal);
            jest.spyOn(prismaService.goal, 'update').mockResolvedValue({
                ...mockGoal,
                ...updateGoalDto,
            });

            const result = await service.update(mockGoal.user_id, mockGoal.id, updateGoalDto);

            expect(result.progress).toBe(50);
            expect(prismaService.goal.update).toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should delete a goal successfully', async () => {
            jest.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoal);
            jest.spyOn(prismaService.goal, 'delete').mockResolvedValue(mockGoal);

            const result = await service.remove(mockGoal.user_id, mockGoal.id);

            expect(result).toEqual(mockGoal);
            expect(prismaService.goal.delete).toHaveBeenCalled();
        });
    });

    describe('addMilestone', () => {
        it('should add a milestone successfully', async () => {
            const createMilestoneDto = {
                title: 'Complete basics',
                due_date: '2026-06-30',
            };

            jest.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoal);
            jest.spyOn(prismaService.milestone, 'create').mockResolvedValue(mockMilestone);

            const result = await service.addMilestone(
                mockGoal.user_id,
                mockGoal.id,
                createMilestoneDto,
            );

            expect(result).toEqual(mockMilestone);
            expect(prismaService.milestone.create).toHaveBeenCalled();
        });
    });
});
