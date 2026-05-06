import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtMiddleware } from '../middleware/jwt.middleware';
import {
  DashboardProxyController,
  GoalProxyController,
  QuizProxyController,
  SummaryProxyController,
  TutorProxyController,
} from './learning-proxy.controller';

@Module({
  controllers: [
    DashboardProxyController,
    SummaryProxyController,
    QuizProxyController,
    TutorProxyController,
    GoalProxyController,
  ],
})
export class LearningProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        DashboardProxyController,
        SummaryProxyController,
        QuizProxyController,
        TutorProxyController,
        GoalProxyController,
      );
  }
}
