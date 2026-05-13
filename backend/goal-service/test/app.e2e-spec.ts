import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';

describe('Goal Service E2E Tests', () => {
  let app: INestApplication<App>;
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  let createdGoalId: string;
  let createdMilestoneId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('GET /health - should return service status', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'goal-service');
    });
  });

  describe('POST /api/goals - Create Goal', () => {
    it('should create a goal successfully', async () => {
      const createGoalDto = {
        title: 'Learn NestJS Fundamentals',
        description: 'Master NestJS from beginner to advanced',
        category: 'Backend Development',
        target_date: '2026-12-31',
      };

      const response = await request(app.getHttpServer())
        .post('/api/goals')
        .set('x-user-id', userId)
        .send(createGoalDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', createGoalDto.title);
      expect(response.body).toHaveProperty('user_id', userId);
      expect(response.body).toHaveProperty('progress', 0);
      expect(response.body).toHaveProperty('status', 'active');

      createdGoalId = response.body.id;
    });

    it('should fail without x-user-id header', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/goals')
        .send({ title: 'Test Goal' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/goals - List Goals', () => {
    it('should return all goals for the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/goals')
        .set('x-user-id', userId);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/goals/:id - Get Goal Details', () => {
    it('should return goal details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/goals/${createdGoalId}`)
        .set('x-user-id', userId);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', createdGoalId);
    });
  });

  describe('PUT /api/goals/:id - Update Goal', () => {
    it('should update goal progress', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/goals/${createdGoalId}`)
        .set('x-user-id', userId)
        .send({ progress: 50 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('progress', 50);
    });
  });

  describe('POST /api/goals/:id/milestones - Add Milestone', () => {
    it('should add a milestone', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/goals/${createdGoalId}/milestones`)
        .set('x-user-id', userId)
        .send({
          title: 'Complete NestJS Basics',
          due_date: '2026-06-30',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Complete NestJS Basics');

      createdMilestoneId = response.body.id;
    });
  });

  describe('PUT /api/goals/:id/milestones/:milestoneId - Update Milestone', () => {
    it('should mark milestone as done', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/goals/${createdGoalId}/milestones/${createdMilestoneId}`)
        .set('x-user-id', userId)
        .send({ is_done: true });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('is_done', true);
    });
  });

  describe('DELETE /api/goals/:id - Delete Goal', () => {
    it('should delete a goal', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/goals/${createdGoalId}`)
        .set('x-user-id', userId);

      expect(response.status).toBe(200);
    });
  });
});
