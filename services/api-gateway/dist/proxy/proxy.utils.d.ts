import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
export type ProxyConfig = {
    envKey: string;
    fallback: string;
    proxyName: string;
    unavailableMessage: string;
};
export declare function buildProxy(configService: ConfigService, config: ProxyConfig): {
    logger: Logger;
    proxy: import("http-proxy-middleware").RequestHandler<import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, (err?: any) => void>;
    target: string;
};
export declare function handleProxyError(logger: Logger, res: Response, err: Error | undefined, message: string): void;
