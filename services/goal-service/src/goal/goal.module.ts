import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';

@Module({
  imports: [HttpModule],
  controllers: [GoalController],
  providers: [GoalService],
})
export class GoalModule {}
