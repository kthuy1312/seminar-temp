import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { AskDto } from './dto/ask.dto';

@Controller('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  async askQuestion(@Body() askDto: AskDto) {
    return this.tutorService.askQuestion(askDto);
  }
}
