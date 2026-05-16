"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
class PrefixLogger extends common_1.ConsoleLogger {
    log(message, context) { super.log(`[SUMMARY] ${message}`, context); }
    error(message, stackOrContext) { super.error(`[SUMMARY] ${message}`, stackOrContext); }
    warn(message, context) { super.warn(`[SUMMARY] ${message}`, context); }
    debug(message, context) { super.debug(`[SUMMARY] ${message}`, context); }
    verbose(message, context) { super.verbose(`[SUMMARY] ${message}`, context); }
}
async function bootstrap() {
    process.title = 'SUMMARY SERVICE';
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: new PrefixLogger(),
    });
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.enableCors({
        origin: '*',
        credentials: false,
    });
    if (process.env.ENABLE_RABBITMQ === 'true') {
        app.connectMicroservice({
            transport: microservices_1.Transport.RMQ,
            options: {
                urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
                queue: 'document_events_queue',
                queueOptions: {
                    durable: true,
                },
            },
        });
        app.startAllMicroservices()
            .then(() => logger.log('Summary Microservice is listening to RabbitMQ'))
            .catch(err => logger.error('RabbitMQ connection failed', err));
    }
    else {
        logger.warn('RabbitMQ is DISABLED. Event-based summarization will not work.');
    }
    const port = process.env.PORT || 3006;
    await app.listen(port);
    console.log(`
==================================================
🚀 SUMMARY SERVICE RUNNING
PORT: ${port}
GEMINI: ENABLED
DATABASE: Prisma (PostgreSQL)
==================================================
  `);
}
bootstrap();
//# sourceMappingURL=main.js.map