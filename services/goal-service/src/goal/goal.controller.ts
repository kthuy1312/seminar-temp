import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  UnauthorizedException,
  Put,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GoalService } from './goal.service';
import {
  CreateGoalDto,
  UpdateGoalDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  GoalResponseDto,
  MilestoneResponseDto,
  GoalQueryDto,
} from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';

@ApiTags('goals')
@ApiHeader({
  name: 'x-user-id',
  description: 'The user ID from API Gateway',
  required: true,
})
@Controller('api/goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) { }

  private extractUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is missing');
    }
    return userId;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new learning goal' })
  @ApiResponse({
    status: 201,
    description: 'Goal created successfully',
    type: GoalResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Missing x-user-id header' })
  async create(@Headers() headers: Record<string, string>, @Body() createGoalDto: CreateGoalDto) {
    const userId = this.extractUserId(headers);
    return this.goalService.create(userId, createGoalDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all goals for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of goals with pagination',
  })
  @ApiResponse({ status: 401, description: 'Missing x-user-id header' })
  async findAll(@Headers() headers: Record<string, string>, @Query() query: GoalQueryDto) {
    const userId = this.extractUserId(headers);
    return this.goalService.findAll(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a specific goal by ID' })
  @ApiResponse({
    status: 200,
    description: 'Goal details with milestones',
    type: GoalResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Missing x-user-id header' })
  async findOne(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    const userId = this.extractUserId(headers);
    return this.goalService.findOne(userId, id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a goal' })
  @ApiResponse({
    status: 200,
    description: 'Goal updated successfully',
    type: GoalResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Missing x-user-id header' })
  async update(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    const userId = this.extractUserId(headers);
    return this.goalService.update(userId, id, updateGoalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a goal' })
  @ApiResponse({
    status: 200,
    description: 'Goal deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Missing x-user-id header' })
  async remove(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    const userId = this.extractUserId(headers);
    return this.goalService.remove(userId, id);
  }

  @Post(':id/milestones')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a milestone to a goal' })
  @ApiResponse({
    status: 201,
    description: 'Milestone added successfully',
    type: MilestoneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Missing x-user-id header' })
  async addMilestone(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() createMilestoneDto: CreateMilestoneDto,
  ) {
    const userId = this.extractUserId(headers);
    return this.goalService.addMilestone(userId, id, createMilestoneDto);
  }

  @Put(':id/milestones/:milestoneId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a milestone' })
  @ApiResponse({
    status: 200,
    description: 'Milestone updated successfully',
    type: MilestoneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Milestone not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Missing x-user-id header' })
  async updateMilestone(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
  ) {
    const userId = this.extractUserId(headers);
    return this.goalService.updateMilestone(userId, id, milestoneId, updateMilestoneDto);
  }

  @Delete(':id/milestones/:milestoneId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a milestone' })
  @ApiResponse({
    status: 200,
    description: 'Milestone deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Milestone not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Missing x-user-id header' })
  async removeMilestone(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    const userId = this.extractUserId(headers);
    return this.goalService.removeMilestone(userId, id, milestoneId);
  }
}
