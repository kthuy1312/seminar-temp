import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TutorController } from './tutor.controller';
import { TutorService } from './tutor.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [TutorController],
  providers: [TutorService, PrismaService],
  exports: [TutorService],
})
export class TutorModule {}
