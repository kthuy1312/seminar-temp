import { All, Controller, Logger, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { buildProxy, handleProxyError } from './proxy.utils';

@Controller('api/dashboard')
export class DashboardProxyController {
  private readonly logger: Logger;
  private readonly proxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const built = buildProxy(this.configService, {
      envKey: 'DASHBOARD_SERVICE_URL',
      fallback: 'http://localhost:3002',
      proxyName: 'DashboardProxy',
      unavailableMessage: 'Dashboard service unavailable',
    });
    this.logger = built.logger;
    this.proxy = built.proxy;
  }

  private forward(req: Request, res: Response) {
    this.proxy(req, res, (err?: Error) => {
      handleProxyError(this.logger, res, err, 'Dashboard service unavailable');
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

  private forward(req: Request, res: Response) {
    this.proxy(req, res, (err?: Error) => {
      handleProxyError(this.logger, res, err, 'Summary service unavailable');
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

@Controller('api/quiz')
export class QuizProxyController {
  private readonly logger: Logger;
  private readonly proxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const built = buildProxy(this.configService, {
      envKey: 'QUIZ_SERVICE_URL',
      fallback: 'http://localhost:3005',
      proxyName: 'QuizProxy',
      unavailableMessage: 'Quiz service unavailable',
    });
    this.logger = built.logger;
    this.proxy = built.proxy;
  }

  private forward(req: Request, res: Response) {
    this.proxy(req, res, (err?: Error) => {
      handleProxyError(this.logger, res, err, 'Quiz service unavailable');
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
    });
    this.logger = built.logger;
    this.proxy = built.proxy;
  }

  private forward(req: Request, res: Response) {
    this.proxy(req, res, (err?: Error) => {
      handleProxyError(this.logger, res, err, 'Tutor service unavailable');
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

@Controller('api/goals')
export class GoalProxyController {
  private readonly logger: Logger;
  private readonly proxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const built = buildProxy(this.configService, {
      envKey: 'GOAL_SERVICE_URL',
      fallback: 'http://localhost:3004',
      proxyName: 'GoalProxy',
      unavailableMessage: 'Goal service unavailable',
    });
    this.logger = built.logger;
    this.proxy = built.proxy;
  }

  private forward(req: Request, res: Response) {
    this.proxy(req, res, (err?: Error) => {
      handleProxyError(this.logger, res, err, 'Goal service unavailable');
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
