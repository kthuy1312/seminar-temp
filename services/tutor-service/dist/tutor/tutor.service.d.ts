import { PrismaService } from '../prisma/prisma.service';
import { AskDto } from './dto/ask.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class TutorService {
    private readonly prisma;
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private genAI;
    constructor(prisma: PrismaService, configService: ConfigService, httpService: HttpService);
    askQuestion(askDto: AskDto): Promise<{
        conversationId: string;
        answer: string;
    }>;
    private getSummaryFromService;
    private generateAnswer;
    private generateFallbackAnswer;
    getHistory(userId: string, documentId?: string, skip?: number, take?: number): Promise<{
        data: {
            conversationId: string;
            documentId: string;
            messages: {
                conversationId: string;
                id: string;
                createdAt: Date;
                role: string;
                content: string;
            }[];
        }[];
        pagination: {
            skip: number;
            take: number;
            total: number;
        };
    }>;
}
