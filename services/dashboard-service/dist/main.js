"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Dashboard Service API')
        .setDescription('Aggregated stats and activity APIs')
        .setVersion('1.0.0')
        .addTag('dashboard')
        .build();
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, swaggerDocument);
    if (process.env.ENABLE_RABBITMQ !== 'false') {
        app.connectMicroservice({
            transport: microservices_1.Transport.RMQ,
            options: {
                urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
                queue: process.env.DASHBOARD_QUEUE || 'dashboard_events_queue',
                queueOptions: {
                    durable: true,
                },
            },
        });
        await app.startAllMicroservices();
        logger.log('Dashboard microservice is listening to RabbitMQ');
    }
    else {
        logger.warn('RabbitMQ is disabled for Dashboard Service');
    }
    const port = Number(process.env.PORT || 3002);
    await app.listen(port);
    logger.log(`Dashboard Service is running on http://localhost:${port}`);
    logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map