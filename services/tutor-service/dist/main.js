"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
class PrefixLogger extends common_1.ConsoleLogger {
    log(message, context) { super.log(`[TUTOR] ${message}`, context); }
    error(message, stackOrContext) { super.error(`[TUTOR] ${message}`, stackOrContext); }
    warn(message, context) { super.warn(`[TUTOR] ${message}`, context); }
    debug(message, context) { super.debug(`[TUTOR] ${message}`, context); }
    verbose(message, context) { super.verbose(`[TUTOR] ${message}`, context); }
}
async function bootstrap() {
    process.title = 'TUTOR SERVICE';
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: new PrefixLogger(),
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.enableCors({
        origin: '*',
        credentials: false,
    });
    const port = process.env.PORT || 3007;
    await app.listen(port);
    console.log(`
==================================================
🚀 TUTOR SERVICE RUNNING
PORT: ${port}
GEMINI: ENABLED
DATABASE: Prisma (PostgreSQL)
==================================================
  `);
}
bootstrap();
//# sourceMappingURL=main.js.map