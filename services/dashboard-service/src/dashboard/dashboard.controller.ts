import { Controller, Get, Headers, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { GetActivityQueryDto } from './dto/get-activity-query.dto';
import { GetProgressQueryDto } from './dto/get-progress-query.dto';
import { GetStatsQueryDto } from './dto/get-stats-query.dto';

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
}
