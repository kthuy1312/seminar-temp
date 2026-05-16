import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class SummaryService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    handleDocumentUploaded(payload: {
        document_id: string;
    }): Promise<void>;
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
    private syncSummaryFromDocument;
    private triggerDocumentReprocess;
}
