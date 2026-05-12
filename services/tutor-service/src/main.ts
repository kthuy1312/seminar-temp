import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: false,
  });

  const port = process.env.PORT || 3007;
  await app.listen(port);
  console.log(`🎓 Tutor Service is running on http://localhost:${port}`);
}
bootstrap();
