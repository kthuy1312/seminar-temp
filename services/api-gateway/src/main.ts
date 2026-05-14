import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // IMPORTANT: bodyParser must be disabled so http-proxy-middleware can
  // forward the raw body stream to upstream services.
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3100',
    credentials: false,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API Gateway is running on http://localhost:${port}`);
  console.log(`   → /api/auth/* → auth-service (${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'})`);
  console.log(`   → /api/documents/* → document-service (${process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3003'})`);
  console.log(`   → /api/dashboard/* → dashboard-service (${process.env.DASHBOARD_SERVICE_URL || 'http://localhost:3002'})`);
  console.log(`   → /api/summaries/* → summary-service (${process.env.SUMMARY_SERVICE_URL || 'http://localhost:3006'})`);
  console.log(`   → /api/quiz/* → quiz-service (${process.env.QUIZ_SERVICE_URL || 'http://localhost:3005'})`);
  console.log(`   → /api/tutor/* → tutor-service (${process.env.TUTOR_SERVICE_URL || 'http://localhost:3007'})`);
  console.log(`   → /api/goals/* → goal-service (${process.env.GOAL_SERVICE_URL || 'http://localhost:3004'})`);
}

bootstrap();
