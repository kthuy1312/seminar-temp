"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
class PrefixLogger extends common_1.ConsoleLogger {
    log(message, context) { super.log(`[QUIZ] ${message}`, context); }
    error(message, stackOrContext) { super.error(`[QUIZ] ${message}`, stackOrContext); }
    warn(message, context) { super.warn(`[QUIZ] ${message}`, context); }
    debug(message, context) { super.debug(`[QUIZ] ${message}`, context); }
    verbose(message, context) { super.verbose(`[QUIZ] ${message}`, context); }
}
async function bootstrap() {
    process.title = 'QUIZ SERVICE';
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: new PrefixLogger(),
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.enableCors({
        origin: '*',
        credentials: false,
    });
    const port = process.env.PORT ?? 3005;
    await app.listen(port);
    console.log(`
==================================================
🚀 QUIZ SERVICE RUNNING
PORT: ${port}
GEMINI: ENABLED
DATABASE: Prisma (PostgreSQL)
==================================================
  `);
}
bootstrap();
//# sourceMappingURL=main.js.map