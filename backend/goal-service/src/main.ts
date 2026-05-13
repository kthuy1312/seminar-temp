import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Goal Service API')
    .setDescription(
      'AI Study Assistant - Goal Service\n\n' +
      'Manage learning goals and milestones for students.\n\n' +
      '## Features\n' +
      '- Create, read, update, delete learning goals\n' +
      '- Add and track milestones for each goal\n' +
      '- Auto-calculate goal progress based on milestones\n' +
      '- Filter goals by status and category\n' +
      '- Pagination support\n\n' +
      '## Authentication\n' +
      'All endpoints require `x-user-id` header from API Gateway.',
    )
    .setVersion('1.0.0')
    .addTag('goals', 'Goal management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
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
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start Goal Service', error);
  process.exit(1);
});
