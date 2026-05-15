import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { QueryDocumentsDto } from './dto/documents.dto';
import { TextExtractorService, ExtractResult } from './text-extractor.service';
export declare class DocumentsService {
    private readonly prisma;
    private readonly textExtractor;
    private readonly rabbitClient;
    private readonly logger;
    private readonly ALLOWED_TYPES;
    constructor(prisma: PrismaService, textExtractor: TextExtractorService, rabbitClient: ClientProxy);
    upload(file: Express.Multer.File, userId?: string): Promise<{
        id: any;
        userId: any;
        fileName: any;
        fileType: any;
        fileSize: number;
        fileSizeFormatted: string;
        url: string;
        uploadedAt: any;
    }>;
    findAll(query: QueryDocumentsDto): Promise<{
        id: any;
        userId: any;
        fileName: any;
        fileType: any;
        fileSize: number;
        fileSizeFormatted: string;
        url: string;
        uploadedAt: any;
    }[]>;
    extractText(id: string): Promise<ExtractResult>;
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
    private serializeDocument;
    private formatBytes;
}
