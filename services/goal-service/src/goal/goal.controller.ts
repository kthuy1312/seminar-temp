import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GoalService } from './goal.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';

@Controller('api/goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  /** POST /api/goals */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateGoalDto,
  ) {
    return this.goalService.create(userId, dto);
  }

  /** GET /api/goals */
  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    return this.goalService.findAll(userId);
  }

  /** GET /api/goals/:id */
  @Get(':id')
  findOne(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.goalService.findOne(userId, id);
  }

  /** PUT /api/goals/:id */
  @Put(':id')
  update(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalService.update(userId, id, dto);
  }

  /** DELETE /api/goals/:id */
  @Delete(':id')
  remove(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.goalService.remove(userId, id);
  }

  /** GET /api/goals/:id/roadmap */
  @Get(':id/roadmap')
  getRoadmap(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    // Note: userId is passed but not strictly needed if we trust the gateway,
    // but good for isolation if we want to check ownership.
    return this.goalService.getRoadmap(id);
  }

  /** PUT /api/goals/roadmap/:itemId */
  @Put('roadmap/:itemId')
  toggleRoadmapItem(
    @Param('itemId') itemId: string,
    @Body('is_completed') isCompleted: boolean,
  ) {
    return this.goalService.toggleRoadmapItem(itemId, isCompleted);
  }
}
