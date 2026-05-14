import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
export declare class AuthProxyController {
    private readonly configService;
    private readonly logger;
    private readonly proxy;
    constructor(configService: ConfigService);
    proxy_request(req: Request, res: Response): Promise<void>;
}
