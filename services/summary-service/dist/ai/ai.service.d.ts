import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private configService;
    private readonly logger;
    private genAI;
    constructor(configService: ConfigService);
    summarizeText(text: string): Promise<string>;
}
