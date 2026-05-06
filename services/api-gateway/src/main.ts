import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API Gateway is running on http://localhost:${port}`);
  console.log(`   → /api/auth/* → auth-service (${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'})`);
  console.log(`   → /api/documents/* → document-service (${process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3004'})`);
  console.log(`   → /api/dashboard/* → dashboard-service (${process.env.DASHBOARD_SERVICE_URL || 'http://localhost:3008'})`);
  console.log(`   → /api/summaries/* → summary-service (${process.env.SUMMARY_SERVICE_URL || 'http://localhost:3005'})`);
  console.log(`   → /api/quiz/* → quiz-service (${process.env.QUIZ_SERVICE_URL || 'http://localhost:3006'})`);
  console.log(`   → /api/tutor/* → tutor-service (${process.env.TUTOR_SERVICE_URL || 'http://localhost:3007'})`);
  console.log(`   → /api/goals/* → goal-service (${process.env.GOAL_SERVICE_URL || 'http://localhost:3002'})`);
}

bootstrap();
