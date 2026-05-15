import { SummaryService } from './summary.service';
export declare class SummaryController {
    private readonly summaryService;
    constructor(summaryService: SummaryService);
    handleDocumentUploadedEvent(data: any): Promise<void>;
    getSummaryByDocumentId(documentId: string): Promise<{
        id: string;
        documentId: string;
        content: string;
        createdAt: Date;
    }>;
    generateSummary(body: {
        documentId: string;
        force?: boolean;
    }): Promise<{
        id: string;
        documentId: string;
        content: string;
        createdAt: Date;
    }>;
}
