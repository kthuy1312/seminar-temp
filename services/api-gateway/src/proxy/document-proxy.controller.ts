import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { buildProxy, handleProxyError } from './proxy.utils';

/**
 * Document Proxy Controller
 * Forward tất cả request /api/documents/* → document-service (port 3004)
 */
@Controller('api/documents')
export class DocumentProxyController {
  private readonly logger: Logger;
  private readonly proxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const built = buildProxy(this.configService, {
      envKey: 'DOCUMENT_SERVICE_URL',
      fallback: 'http://localhost:3003',
      proxyName: 'DocumentProxy',
      unavailableMessage: 'Document service unavailable',
    });

    this.logger = built.logger;
    this.proxy = built.proxy;
  }

  private forward(req: Request, res: Response) {
    this.proxy(req, res, (err?: any) => {
      handleProxyError(
        this.logger,
        res,
        err,
        'Document service unavailable',
      );
    });
  }

  @All()
  proxyRoot(@Req() req: Request, @Res() res: Response) {
    this.forward(req, res);
  }

  @All('*')
  proxyNested(@Req() req: Request, @Res() res: Response) {
    this.forward(req, res);
  }
}
