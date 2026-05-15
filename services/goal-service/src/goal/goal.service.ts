import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoalService {
  private readonly logger = new Logger(GoalService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn('GEMINI_API_KEY is not configured in .env');
    }
  }

  async create(userId: string, dto: CreateGoalDto) {
    if (!userId) {
      throw new BadRequestException('User ID is required (x-user-id header missing)');
    }

    const goal = await this.prisma.goal.create({
      data: {
        user_id: userId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        target_date: dto.target_date ? new Date(dto.target_date) : null,
        target_score: dto.target_score,
        current_level: dto.current_level,
        daily_hours: dto.daily_hours ? Number(dto.daily_hours) : null,
        subjects: dto.subjects || [],
      },
      include: { milestones: true, roadmap_items: true },
    });

    this.logger.log(`Goal created: ${goal.id} for user ${userId}`);

    // Notify Dashboard
    this.notifyDashboardOfGoalCreated(userId, goal.id, goal.title);

    // Trigger AI Analysis immediately for demo completeness
    if (this.genAI) {
      try {
        await this.analyzeGoalWithAI(goal.id);
      } catch (err) {
        this.logger.error(`AI Analysis failed for goal ${goal.id}: ${err.message}`);
      }
    }

    const finalGoal = await this.prisma.goal.findUnique({
      where: { id: goal.id },
      include: { milestones: true, roadmap_items: true },
    });

    return this.serializeGoal(finalGoal);
  }

  async findAll(userId: string) {
    if (!userId) {
      return { data: [], total: 0 };
    }

    const goals = await this.prisma.goal.findMany({
      where: { user_id: userId },
      include: { milestones: true, roadmap_items: true },
      orderBy: { created_at: 'desc' },
    });

    return {
      data: goals.map((g) => this.serializeGoal(g)),
      total: goals.length,
    };
  }

  async findOne(userId: string, id: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, user_id: userId },
      include: { milestones: true, roadmap_items: true },
    });

    if (!goal) {
      throw new NotFoundException(`Goal ${id} not found`);
    }

    return this.serializeGoal(goal);
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, user_id: userId },
    });

    if (!goal) {
      throw new NotFoundException(`Goal ${id} not found`);
    }

    const updated = await this.prisma.goal.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.target_date && { target_date: new Date(dto.target_date) }),
        ...(dto.status && { status: dto.status }),
        ...(dto.progress !== undefined && { progress: dto.progress }),
      },
      include: { milestones: true, roadmap_items: true },
    });

    return this.serializeGoal(updated);
  }

  async remove(userId: string, id: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, user_id: userId },
    });

    if (!goal) {
      throw new NotFoundException(`Goal ${id} not found`);
    }

    await this.prisma.goal.delete({ where: { id } });
    return { success: true, message: `Goal ${id} deleted` };
  }

  async toggleRoadmapItem(itemId: string, isCompleted: boolean) {
    const item = await this.prisma.roadmapItem.update({
      where: { id: itemId },
      data: { is_completed: isCompleted },
    });
    return item;
  }

  async analyzeGoalWithAI(goalId: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || !this.genAI) return null;

    const prompt = `
      Bạn là chuyên gia tư vấn học tập AI. Hãy phân tích mục tiêu học tập sau:
      - Mục tiêu: ${goal.title} (${goal.target_score || 'N/A'})
      - Trình độ hiện tại: ${goal.current_level || 'Chưa xác định'}
      - Môn học: ${(goal.subjects || []).join(', ') || 'Chưa chọn'}
      - Thời gian học: ${goal.daily_hours || 0} giờ/ngày

      Hãy trả về kết quả dưới định dạng JSON với các trường:
      - gap_analysis: Phân tích khoảng cách giữa hiện tại và mục tiêu (tiếng Việt)
      - priority_subjects: Danh sách các môn cần ưu tiên và lý do (tiếng Việt)
      - difficulty_level: Đánh giá mức độ khó (Dễ/Trung bình/Khó)
      - suggestions: 3-5 gợi ý học tập ngắn gọn

      Trả về DUY NHẤT mã JSON, không kèm giải thích hay Markdown tags.
    `;

    try {
      const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.replace(/```json\n|\n```|```/g, '').trim();
      const analysis = JSON.parse(jsonStr);

      await this.prisma.goal.update({
        where: { id: goalId },
        data: { ai_analysis: analysis },
      });
      
      return analysis;
    } catch (error) {
      this.logger.error(`Gemini Analysis Error: ${error.message}`);
      return null;
    }
  }

  async getRoadmap(goalId: string) {
    const goal = await this.prisma.goal.findUnique({ 
        where: { id: goalId },
        include: { roadmap_items: { orderBy: { day: 'asc' } } }
    });
    
    if (!goal) throw new NotFoundException('Goal not found');
    
    if (goal.roadmap_items.length > 0) return goal.roadmap_items;

    if (!this.genAI) throw new InternalServerErrorException('AI Service not available (GEMINI_API_KEY missing)');

    const prompt = `
      Hãy tạo lộ trình học tập chi tiết trong 7 ngày cho học sinh:
      - Mục tiêu: ${goal.title} (${goal.target_score || 'N/A'})
      - Trình độ: ${goal.current_level || 'Chưa xác định'}
      - Môn học: ${(goal.subjects || []).join(', ') || 'Chưa chọn'}
      - Thời gian: ${goal.daily_hours || 0} giờ/ngày

      Trả về danh sách 7 ngày, mỗi ngày gồm:
      - day: số thứ tự ngày (1-7)
      - topic: Chủ đề học (tiếng Việt)
      - activity: Hoạt động cụ thể (tiếng Việt)
      - duration: Thời lượng (ví dụ: "2h")

      Định dạng trả về: JSON array. Ví dụ: [{"day": 1, "topic": "...", "activity": "...", "duration": "..."}]
      Trả về DUY NHẤT mã JSON, không kèm giải thích hay Markdown tags.
    `;

    try {
      const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.replace(/```json\n|\n```|```/g, '').trim();
      const roadmap = JSON.parse(jsonStr);

      await this.prisma.roadmapItem.createMany({
        data: roadmap.map((item: any) => ({
          goal_id: goalId,
          day: item.day,
          topic: item.topic,
          activity: item.activity,
          duration: item.duration,
        })),
      });

      return await this.prisma.roadmapItem.findMany({
        where: { goal_id: goalId },
        orderBy: { day: 'asc' }
      });
    } catch (error) {
      this.logger.error(`Gemini Roadmap Error: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate roadmap with AI');
    }
  }

  private async notifyDashboardOfGoalCreated(userId: string, goalId: string, title: string) {
    try {
      const dashboardServiceUrl = this.configService.get<string>('DASHBOARD_SERVICE_URL') || 'http://localhost:3002';
      await firstValueFrom(
        this.httpService.post(`${dashboardServiceUrl}/api/dashboard/events/goal-created`, {
          user_id: userId,
          goal_id: goalId,
          title: title,
          occurred_at: new Date().toISOString(),
        }),
      );
      this.logger.log(`Notified Dashboard of goal ${goalId}`);
    } catch (err) {
      this.logger.error(`Failed to notify Dashboard of goal ${goalId}: ${err.message}`);
    }
  }

  private serializeGoal(goal: any) {
    return {
      id: goal.id,
      title: goal.title,
      description: goal.description ?? null,
      category: goal.category ?? null,
      status: goal.status,
      progress: goal.progress,
      target_date: goal.target_date?.toISOString().split('T')[0] ?? null,
      target_score: goal.target_score,
      current_level: goal.current_level,
      daily_hours: goal.daily_hours,
      subjects: goal.subjects,
      ai_analysis: goal.ai_analysis,
      milestones: (goal.milestones ?? []).map((m: any) => ({
        id: m.id,
        title: m.title,
        is_done: m.is_done,
        due_date: m.due_date?.toISOString().split('T')[0] ?? null,
      })),
      roadmap_items: (goal.roadmap_items ?? []).map((r: any) => ({
        id: r.id,
        day: r.day,
        topic: r.topic,
        activity: r.activity,
        duration: r.duration,
        is_completed: r.is_completed,
      })),
      created_at: goal.created_at,
      updated_at: goal.updated_at,
    };
  }
}
