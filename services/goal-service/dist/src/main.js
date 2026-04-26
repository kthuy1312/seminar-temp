"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Goal Service API')
        .setDescription('AI Study Assistant - Goal Service\n\n' +
        'Manage learning goals and milestones for students.\n\n' +
        '## Features\n' +
        '- Create, read, update, delete learning goals\n' +
        '- Add and track milestones for each goal\n' +
        '- Auto-calculate goal progress based on milestones\n' +
        '- Filter goals by status and category\n' +
        '- Pagination support\n\n' +
        '## Authentication\n' +
        'All endpoints require `x-user-id` header from API Gateway.')
        .setVersion('1.0.0')
        .addTag('goals', 'Goal management endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            displayOperationId: true,
        },
    });
    const port = process.env.PORT ?? 3002;
    await app.listen(port);
    logger.log(`🚀 Goal Service listening on port ${port}`);
    logger.log(`📚 Swagger documentation available at http://localhost:${port}/docs`);
}
bootstrap().catch((error) => {
    const logger = new common_1.Logger('Bootstrap');
    logger.error('Failed to start Goal Service', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map