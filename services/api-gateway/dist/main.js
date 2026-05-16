"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
class PrefixLogger extends common_1.ConsoleLogger {
    log(message, context) { super.log(`[GATEWAY] ${message}`, context); }
    error(message, stackOrContext) { super.error(`[GATEWAY] ${message}`, stackOrContext); }
    warn(message, context) { super.warn(`[GATEWAY] ${message}`, context); }
    debug(message, context) { super.debug(`[GATEWAY] ${message}`, context); }
    verbose(message, context) { super.verbose(`[GATEWAY] ${message}`, context); }
}
async function bootstrap() {
    process.title = 'API GATEWAY';
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: false,
        logger: new PrefixLogger(),
    });
    app.enableCors({
        origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3100',
        credentials: false,
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`
==================================================
⚡ API GATEWAY RUNNING
PORT: ${port}
ROLE: Reverse Proxy
AUTH: JWT Middleware
==================================================
  `);
}
bootstrap();
//# sourceMappingURL=main.js.map