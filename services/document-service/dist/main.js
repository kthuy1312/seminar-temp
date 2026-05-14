"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
    app.useStaticAssets(uploadsDir, {
        prefix: '/api/documents/files',
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.enableCors({ origin: '*', credentials: false });
    const port = process.env.PORT ?? 3003;
    await app.listen(port);
    console.log(`📄 Document Service is running on http://localhost:${port}`);
    console.log(`📁 Files served at  http://localhost:${port}/api/documents/files/<filename>`);
}
bootstrap();
//# sourceMappingURL=main.js.map