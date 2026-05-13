import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DashboardService } from './dashboard.service';
import { DocumentUploadedEventDto } from './dto/events/document-uploaded-event.dto';
import { GoalCompletedEventDto } from './dto/events/goal-completed-event.dto';
import { GoalCreatedEventDto } from './dto/events/goal-created-event.dto';
import { QuizCompletedEventDto } from './dto/events/quiz-completed-event.dto';
import { RoadmapStepCompletedEventDto } from './dto/events/roadmap-step-completed-event.dto';
import { SummaryCreatedEventDto } from './dto/events/summary-created-event.dto';
import { UserCreatedEventDto } from './dto/events/user-created-event.dto';

@Controller()
export class DashboardEventsController {
  private readonly logger = new Logger(DashboardEventsController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @EventPattern('user.created')
  async onUserCreated(@Payload() payload: UserCreatedEventDto) {
    this.logger.debug(`Received user.created for user ${payload.user_id}`);
    await this.dashboardService.handleUserCreated(payload);
  }

  @EventPattern('goal.created')
  async onGoalCreated(@Payload() payload: GoalCreatedEventDto) {
    this.logger.debug(`Received goal.created for user ${payload.user_id}`);
    await this.dashboardService.handleGoalCreated(payload);
  }

  @EventPattern('goal.completed')
  async onGoalCompleted(@Payload() payload: GoalCompletedEventDto) {
    this.logger.debug(`Received goal.completed for user ${payload.user_id}`);
    await this.dashboardService.handleGoalCompleted(payload);
  }

  @EventPattern('document.uploaded')
  async onDocumentUploaded(@Payload() payload: DocumentUploadedEventDto) {
    this.logger.debug(`Received document.uploaded for user ${payload.user_id}`);
    await this.dashboardService.handleDocumentUploaded(payload);
  }

  @EventPattern('quiz.completed')
  async onQuizCompleted(@Payload() payload: QuizCompletedEventDto) {
    this.logger.debug(`Received quiz.completed for user ${payload.user_id}`);
    await this.dashboardService.handleQuizCompleted(payload);
  }

  @EventPattern('roadmap.step_completed')
  async onRoadmapStepCompleted(
    @Payload() payload: RoadmapStepCompletedEventDto,
  ) {
    this.logger.debug(
      `Received roadmap.step_completed for user ${payload.user_id}`,
    );
    await this.dashboardService.handleRoadmapStepCompleted(payload);
  }

  @EventPattern('summary.created')
  async onSummaryCreated(@Payload() payload: SummaryCreatedEventDto) {
    this.logger.debug(`Received summary.created for user ${payload.user_id}`);
    await this.dashboardService.handleSummaryCreated(payload);
  }
}
