import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DocumentAnalysisClient {
  private readonly logger = new Logger(DocumentAnalysisClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async fetchAnalysis(documentId: string): Promise<any> {
    try {
      const documentServiceUrl = this.configService.get<string>('DOCUMENT_SERVICE_URL', 'http://localhost:3003');
      const res = await firstValueFrom(this.httpService.get(`${documentServiceUrl}/api/documents/${documentId}/ai-analysis`));
      return res.data;
    } catch (e: any) {
      this.logger.error(`Failed to fetch analysis: ${e.message}`);
      return null;
    }
  }

  async fetchDocumentText(documentId: string): Promise<string> {
    try {
      const documentServiceUrl = this.configService.get<string>('DOCUMENT_SERVICE_URL', 'http://localhost:3003');
      const res = await firstValueFrom(this.httpService.post(`${documentServiceUrl}/api/documents/${documentId}/extract`));
      return res.data?.text || res.data?.data?.text || '';
    } catch (e: any) {
      this.logger.error(`Failed to fetch text: ${e.message}`);
      return '';
    }
  }
}
