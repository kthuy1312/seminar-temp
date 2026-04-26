import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { GetActivityQueryDto } from './dto/get-activity-query.dto';
import { GetProgressQueryDto } from './dto/get-progress-query.dto';
import { GetStatsQueryDto } from './dto/get-stats-query.dto';

@ApiTags('dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated dashboard stats' })
  @ApiQuery({ name: 'userId', required: false })
  getStats(@Query() query: GetStatsQueryDto) {
    return this.dashboardService.getStats(query.userId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get user activity logs' })
  getActivity(@Query() query: GetActivityQueryDto) {
    return this.dashboardService.getActivity(query);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get progress timeline by period' })
  getProgress(@Query() query: GetProgressQueryDto) {
    return this.dashboardService.getProgress(query);
  }
}
