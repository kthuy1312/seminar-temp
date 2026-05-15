import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SummaryController],
  providers: [SummaryService, AiService, PrismaService],
  exports: [SummaryService],
})
export class SummaryModule {}
