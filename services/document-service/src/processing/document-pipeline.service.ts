import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DocumentPipelineService {
  private readonly logger = new Logger(DocumentPipelineService.name);

  async scheduleProcessing(documentId: string) {
    this.logger.log(`Scheduling processing for document ${documentId}`);
  }

  async runPipeline(documentId: string, forceAi = false) {
    this.logger.log(`Running pipeline for document ${documentId}, forceAi: ${forceAi}`);
  }
}
