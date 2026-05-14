import { Controller, Post, Get, Body, HttpCode, HttpStatus, Headers, Query } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { AskDto } from './dto/ask.dto';

@Controller('api/tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  async askQuestion(@Body() askDto: AskDto) {
    return this.tutorService.askQuestion(askDto);
  }

  @Get('history')
  async getHistory(
    @Headers('x-user-id') userId: string,
    @Query('documentId') documentId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.tutorService.getHistory(userId, documentId, parseInt(skip || '0'), parseInt(take || '10'));
  }
}
