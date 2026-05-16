"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
class PrefixLogger extends common_1.ConsoleLogger {
    log(message, context) { super.log(`[AUTH] ${message}`, context); }
    error(message, stackOrContext) { super.error(`[AUTH] ${message}`, stackOrContext); }
    warn(message, context) { super.warn(`[AUTH] ${message}`, context); }
    debug(message, context) { super.debug(`[AUTH] ${message}`, context); }
    verbose(message, context) { super.verbose(`[AUTH] ${message}`, context); }
}
async function bootstrap() {
    process.title = 'AUTH SERVICE';
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: new PrefixLogger(),
    });
    app.setGlobalPrefix('api/auth');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`
==================================================
🚀 AUTH SERVICE RUNNING
PORT: ${port}
DATABASE: PostgreSQL
JWT: ENABLED
ENV: ${process.env.NODE_ENV || 'DEVELOPMENT'}
==================================================
  `);
}
bootstrap();
//# sourceMappingURL=main.js.map