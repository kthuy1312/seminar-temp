import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardEventsController } from './dashboard.events.controller';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardController, DashboardEventsController],
  providers: [DashboardService],
})
export class DashboardModule {}
