import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

/**
 * Auth Proxy Controller
 * Forward tất cả request /api/auth/* → auth-service (port 3001)
 */
@Controller('api/auth')
export class AuthProxyController {
  private readonly logger = new Logger('AuthProxy');
  private readonly proxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const authServiceUrl = this.configService.get<string>(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
    );

    this.proxy = createProxyMiddleware({
      target: authServiceUrl,
      changeOrigin: true,
      // Giữ nguyên path: /api/auth/* → /api/auth/*
      // vì auth-service cũng dùng prefix /api/auth
      pathRewrite: undefined,
      on: {
        proxyReq: (proxyReq, req) => {
          this.logger.debug(`Proxying ${req.method} ${req.url} → ${authServiceUrl}`);
        },
        proxyRes: (proxyRes, req) => {
          this.logger.debug(`Response from auth-service: ${proxyRes.statusCode} for ${req.url}`);
        },
        error: (err, req, res) => {
          this.logger.error(`Proxy error: ${err.message}`);
          (res as Response).status(502).json({
            statusCode: 502,
            message: 'Auth service unavailable',
            error: 'Bad Gateway',
          });
        },
      },
    } as Options);
  }

  @All('*')
  async proxy_request(@Req() req: Request, @Res() res: Response) {
    // Delegate to http-proxy-middleware
    this.proxy(req, res, (err?: any) => {
      if (err) {
        this.logger.error(`Proxy middleware error: ${err.message}`);
        if (!res.headersSent) {
          res.status(502).json({
            statusCode: 502,
            message: 'Auth service unavailable',
            error: 'Bad Gateway',
          });
        }
      }
    });
  }
}
