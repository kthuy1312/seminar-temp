import { TutorService } from './tutor.service';
import { AskDto } from './dto/ask.dto';
export declare class TutorController {
    private readonly tutorService;
    constructor(tutorService: TutorService);
    askQuestion(askDto: AskDto): Promise<{
        conversationId: string;
        answer: string;
    }>;
    getHistory(userId: string, documentId?: string, skip?: string, take?: string): Promise<{
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
