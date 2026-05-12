import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import {
  createProxyMiddleware,
  fixRequestBody,
  Options,
} from 'http-proxy-middleware';

export type ProxyConfig = {
  envKey: string;
  fallback: string;
  proxyName: string;
  unavailableMessage: string;
};

export function buildProxy(configService: ConfigService, config: ProxyConfig) {
  const logger = new Logger(config.proxyName);
  const target = configService.get<string>(config.envKey, config.fallback);

  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.headers.authorization) {
          proxyReq.setHeader('authorization', req.headers.authorization);
        }

        if (req.headers['x-user-id']) {
          proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        }

        fixRequestBody(proxyReq, req);

        logger.debug(`Proxying ${req.method} ${req.url} -> ${target}`);
      },
      proxyRes: (proxyRes, req) => {
        logger.debug(
          `Response from ${config.proxyName}: ${proxyRes.statusCode} for ${req.method} ${req.url}`,
        );
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

  return { logger, proxy, target };
}

export function handleProxyError(
  logger: Logger,
  res: Response,
  err: Error | undefined,
  message: string,
) {
  if (err && !res.headersSent) {
    logger.error(`Proxy middleware error: ${err.message}`);
    res.status(502).json({
      statusCode: 502,
      message,
      error: 'Bad Gateway',
    });
  }
}
