import { All, Controller, Logger, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

type ProxyConfig = {
  envKey: string;
  fallback: string;
  proxyName: string;
  unavailableMessage: string;
  pathRewrite?: Record<string, string>;
};

function buildProxy(configService: ConfigService, config: ProxyConfig) {
  const logger = new Logger(config.proxyName);
  const target = configService.get<string>(config.envKey, config.fallback);
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: config.pathRewrite,
    on: {
      proxyReq: (_proxyReq, req) => {
        logger.debug(`Proxying ${req.method} ${req.url} -> ${target}`);
      },
      error: (err, _req, res) => {
        logger.error(`Proxy error: ${err.message}`);
        (res as Response).status(502).json({
          statusCode: 502,
          message: config.unavailableMessage,
          error: 'Bad Gateway',
        });
      },
    },
  } as Options);

  return { logger, proxy };
}

@Controller('api/dashboard')
export class DashboardProxyController {
  private readonly logger: Logger;
  private readonly proxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const built = buildProxy(this.configService, {
      envKey: 'DASHBOARD_SERVICE_URL',
      fallback: 'http://localhost:3008',
      proxyName: 'DashboardProxy',
      unavailableMessage: 'Dashboard service unavailable',
      // dashboard-service has app prefix "api" + controller prefix "api/dashboard"
      pathRewrite: { '^/api/dashboard': '/api/api/dashboard' },
    });
    this.logger = built.logger;
    this.proxy = built.proxy;
  }

  @All('*')
  proxyRequest(@Req() req: Request, @Res() res: Response) {
    this.proxy(req, res, (err?: Error) => {
      if (err && !res.headersSent) {
        this.logger.error(`Proxy middleware error: ${err.message}`);
        res.status(502).json({ statusCode: 502, message: 'Dashboard service unavailable' });
      }
    });
  }
}

@Controller('api/summaries')
export class SummaryProxyController {
  private readonly logger: Logger;
  private readonly proxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const built = buildProxy(this.configService, {
      envKey: 'SUMMARY_SERVICE_URL',
      fallback: 'http://localhost:3005',
      proxyName: 'SummaryProxy',
      unavailableMessage: 'Summary service unavailable',
    });
    this.logger = built.logger;
    this.proxy = built.proxy;
  }

  @All('*')
  proxyRequest(@Req() req: Request, @Res() res: Response) {
    this.proxy(req, res, (err?: Error) => {
      if (err && !res.headersSent) {
        this.logger.error(`Proxy middleware error: ${err.message}`);
        res.status(502).json({ statusCode: 502, message: 'Summary service unavailable' });
      }
    });
  }
}

@Controller('api/quiz')
export class QuizProxyController {
  private readonly logger: Logger;
  private readonly proxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const built = buildProxy(this.configService, {
      envKey: 'QUIZ_SERVICE_URL',
      fallback: 'http://localhost:3006',
      proxyName: 'QuizProxy',
      unavailableMessage: 'Quiz service unavailable',
      pathRewrite: { '^/api/quiz': '/quiz' },
    });
    this.logger = built.logger;
    this.proxy = built.proxy;
  }

  @All('*')
  proxyRequest(@Req() req: Request, @Res() res: Response) {
    this.proxy(req, res, (err?: Error) => {
      if (err && !res.headersSent) {
        this.logger.error(`Proxy middleware error: ${err.message}`);
        res.status(502).json({ statusCode: 502, message: 'Quiz service unavailable' });
      }
    });
  }
}

@Controller('api/tutor')
export class TutorProxyController {
  private readonly logger: Logger;
  private readonly proxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const built = buildProxy(this.configService, {
      envKey: 'TUTOR_SERVICE_URL',
      fallback: 'http://localhost:3007',
      proxyName: 'TutorProxy',
      unavailableMessage: 'Tutor service unavailable',
      pathRewrite: { '^/api/tutor': '/tutor' },
    });
    this.logger = built.logger;
    this.proxy = built.proxy;
  }

  @All('*')
  proxyRequest(@Req() req: Request, @Res() res: Response) {
    this.proxy(req, res, (err?: Error) => {
      if (err && !res.headersSent) {
        this.logger.error(`Proxy middleware error: ${err.message}`);
        res.status(502).json({ statusCode: 502, message: 'Tutor service unavailable' });
      }
    });
  }
}

@Controller('api/goals')
export class GoalProxyController {
  private readonly logger: Logger;
  private readonly proxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const built = buildProxy(this.configService, {
      envKey: 'GOAL_SERVICE_URL',
      fallback: 'http://localhost:3002',
      proxyName: 'GoalProxy',
      unavailableMessage: 'Goal service unavailable',
    });
    this.logger = built.logger;
    this.proxy = built.proxy;
  }

  @All('*')
  proxyRequest(@Req() req: Request, @Res() res: Response) {
    this.proxy(req, res, (err?: Error) => {
      if (err && !res.headersSent) {
        this.logger.error(`Proxy middleware error: ${err.message}`);
        res.status(502).json({ statusCode: 502, message: 'Goal service unavailable' });
      }
    });
  }
}
