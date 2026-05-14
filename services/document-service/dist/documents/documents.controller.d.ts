import { DocumentsService } from './documents.service';
import { QueryDocumentsDto, UploadDocumentDto } from './dto/document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    upload(file: Express.Multer.File | undefined, body: UploadDocumentDto, headerUserId?: string): Promise<{
        id: any;
        userId: any;
        fileName: any;
        fileType: any;
        fileSize: number;
        fileSizeFormatted: string;
        url: string;
        uploadedAt: any;
    }>;
    extractText(id: string): Promise<import("./text-extractor.service").ExtractResult>;
    findAll(query: QueryDocumentsDto, headerUserId?: string): Promise<{
        id: any;
        userId: any;
        fileName: any;
        fileType: any;
        fileSize: number;
        fileSizeFormatted: string;
        url: string;
        uploadedAt: any;
    }[]>;
    findOne(id: string): Promise<{
        id: any;
        userId: any;
        fileName: any;
        fileType: any;
        fileSize: number;
        fileSizeFormatted: string;
        url: string;
        uploadedAt: any;
    }>;
}
