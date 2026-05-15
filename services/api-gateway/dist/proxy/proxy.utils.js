"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProxy = buildProxy;
exports.handleProxyError = handleProxyError;
const common_1 = require("@nestjs/common");
const http_proxy_middleware_1 = require("http-proxy-middleware");
function buildProxy(configService, config) {
    const logger = new common_1.Logger(config.proxyName);
    const target = configService.get(config.envKey, config.fallback);
    const proxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
        target,
        changeOrigin: true,
        xfwd: true,
        proxyTimeout: 120000,
        timeout: 120000,
        on: {
            proxyReq: (proxyReq, req) => {
                if (req.headers.authorization) {
                    proxyReq.setHeader('authorization', req.headers.authorization);
                }
                if (req.headers['x-user-id']) {
                    proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
                }
                logger.debug(`Proxying ${req.method} ${req.url} -> ${target}`);
            },
            proxyRes: (proxyRes, req) => {
                logger.debug(`Response from ${config.proxyName}: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
            },
            error: (err, _req, res) => {
                logger.error(`Proxy error: ${err.message}`);
                res.status(502).json({
                    statusCode: 502,
                    message: config.unavailableMessage,
                    error: 'Bad Gateway',
                });
            },
        },
    });
    return { logger, proxy, target };
}
function handleProxyError(logger, res, err, message) {
    if (err && !res.headersSent) {
        logger.error(`Proxy middleware error: ${err.message}`);
        res.status(502).json({
            statusCode: 502,
            message,
            error: 'Bad Gateway',
        });
    }
}
//# sourceMappingURL=proxy.utils.js.map