import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { buildProxy, handleProxyError } from './proxy.utils';

/**
 * Auth Proxy Controller
 * Forward tất cả request /api/auth/* → auth-service (port 3001)
 */
@Controller('api/auth')
export class AuthProxyController {
  private readonly logger: Logger;
  private readonly proxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const built = buildProxy(this.configService, {
      envKey: 'AUTH_SERVICE_URL',
      fallback: 'http://localhost:3001',
      proxyName: 'AuthProxy',
      unavailableMessage: 'Auth service unavailable',
    });

    this.logger = built.logger;
    this.proxy = built.proxy;
  }

  @All('*')
  async proxy_request(@Req() req: Request, @Res() res: Response) {
    this.proxy(req, res, (err?: any) => {
      handleProxyError(
        this.logger,
        res,
        err,
        'Auth service unavailable',
      );
    });
  }
}
