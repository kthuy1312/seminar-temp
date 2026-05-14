import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
export declare class DocumentProxyController {
    private readonly configService;
    private readonly logger;
    private readonly proxy;
    constructor(configService: ConfigService);
    private forward;
    proxyRoot(req: Request, res: Response): void;
    proxyNested(req: Request, res: Response): void;
}
