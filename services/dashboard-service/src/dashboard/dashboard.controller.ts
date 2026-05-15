import { Controller, Get, Headers, Query, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { GetActivityQueryDto } from './dto/get-activity-query.dto';
import { GetProgressQueryDto } from './dto/get-progress-query.dto';
import { GetStatsQueryDto } from './dto/get-stats-query.dto';
import { GoalCreatedEventDto } from './dto/events/goal-created-event.dto';
import { GoalCompletedEventDto } from './dto/events/goal-completed-event.dto';
import { DocumentUploadedEventDto } from './dto/events/document-uploaded-event.dto';
import { QuizCompletedEventDto } from './dto/events/quiz-completed-event.dto';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated dashboard stats' })
  @ApiQuery({ name: 'userId', required: false })
  getStats(
    @Query() query: GetStatsQueryDto,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    return this.dashboardService.getStats(query.userId || headerUserId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get user activity logs' })
  getActivity(
    @Query() query: GetActivityQueryDto,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    return this.dashboardService.getActivity({
      ...query,
      userId: query.userId || headerUserId,
    });
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get progress timeline by period' })
  getProgress(
    @Query() query: GetProgressQueryDto,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    return this.dashboardService.getProgress({
      ...query,
      userId: query.userId || headerUserId,
    });
  }

  // --- Internal Event Endpoints (via HTTP for demo) ---

  @Post('events/goal-created')
  handleGoalCreated(@Body() payload: GoalCreatedEventDto) {
    return this.dashboardService.handleGoalCreated(payload);
  }

  @Post('events/goal-completed')
  handleGoalCompleted(@Body() payload: GoalCompletedEventDto) {
    return this.dashboardService.handleGoalCompleted(payload);
  }

  @Post('events/document-uploaded')
  handleDocumentUploaded(@Body() payload: DocumentUploadedEventDto) {
    return this.dashboardService.handleDocumentUploaded(payload);
  }

  @Post('events/quiz-completed')
  handleQuizCompleted(@Body() payload: QuizCompletedEventDto) {
    return this.dashboardService.handleQuizCompleted(payload);
  }
}
