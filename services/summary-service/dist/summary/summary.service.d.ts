import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ConfigService } from '@nestjs/config';
export declare class SummaryService {
    private readonly prisma;
    private readonly aiService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, aiService: AiService, configService: ConfigService);
    handleDocumentUploaded(payload: any): Promise<void>;
    private extractTextFromResponse;
    generateSummary(documentId: string, force?: boolean): Promise<{
        id: string;
        documentId: string;
        content: string;
        createdAt: Date;
    }>;
    getSummaryByDocumentId(documentId: string): Promise<{
        id: string;
        documentId: string;
        content: string;
        createdAt: Date;
    }>;
}
