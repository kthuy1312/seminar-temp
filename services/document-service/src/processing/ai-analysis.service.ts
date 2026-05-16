import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);
}
