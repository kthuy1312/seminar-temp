import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

/**
 * Document Proxy Controller
 * Forward tất cả request /api/documents/* → document-service (port 3004)
 */
@Controller('api/documents')
export class DocumentProxyController {
  private readonly logger = new Logger('DocumentProxy');
  private readonly proxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const documentServiceUrl = this.configService.get<string>(
      'DOCUMENT_SERVICE_URL',
      'http://localhost:3004',
    );

    this.proxy = createProxyMiddleware({
      target: documentServiceUrl,
      changeOrigin: true,
      // Giữ nguyên path: /api/documents/* → /api/documents/*
      pathRewrite: undefined,
      on: {
        proxyReq: (proxyReq, req) => {
          this.logger.debug(`Proxying ${req.method} ${req.url} → ${documentServiceUrl}`);
        },
        proxyRes: (proxyRes, req) => {
          this.logger.debug(`Response from document-service: ${proxyRes.statusCode} for ${req.url}`);
        },
        error: (err, req, res) => {
          this.logger.error(`Proxy error: ${err.message}`);
          (res as Response).status(502).json({
            statusCode: 502,
            message: 'Document service unavailable',
            error: 'Bad Gateway',
          });
        },
      },
    } as Options);
  }

  @All('*')
  async proxy_request(@Req() req: Request, @Res() res: Response) {
    this.proxy(req, res, (err?: any) => {
      if (err) {
        this.logger.error(`Proxy middleware error: ${err.message}`);
        if (!res.headersSent) {
          res.status(502).json({
            statusCode: 502,
            message: 'Document service unavailable',
            error: 'Bad Gateway',
          });
        }
      }
    });
  }
}
