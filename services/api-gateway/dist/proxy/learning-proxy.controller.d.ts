import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
export declare class DashboardProxyController {
    private readonly configService;
    private readonly logger;
    private readonly proxy;
    constructor(configService: ConfigService);
    private forward;
    proxyRoot(req: Request, res: Response): void;
    proxyNested(req: Request, res: Response): void;
}
export declare class SummaryProxyController {
    private readonly configService;
    private readonly logger;
    private readonly proxy;
    constructor(configService: ConfigService);
    private forward;
    proxyRoot(req: Request, res: Response): void;
    proxyNested(req: Request, res: Response): void;
}
export declare class QuizProxyController {
    private readonly configService;
    private readonly logger;
    private readonly proxy;
    constructor(configService: ConfigService);
    private forward;
    proxyRoot(req: Request, res: Response): void;
    proxyNested(req: Request, res: Response): void;
}
export declare class TutorProxyController {
    private readonly configService;
    private readonly logger;
    private readonly proxy;
    constructor(configService: ConfigService);
    private forward;
    proxyRoot(req: Request, res: Response): void;
    proxyNested(req: Request, res: Response): void;
}
export declare class GoalProxyController {
    private readonly configService;
    private readonly logger;
    private readonly proxy;
    constructor(configService: ConfigService);
    private forward;
    proxyRoot(req: Request, res: Response): void;
    proxyNested(req: Request, res: Response): void;
}
