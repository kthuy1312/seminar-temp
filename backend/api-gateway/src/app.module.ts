import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { AuthProxyModule } from './proxy/auth-proxy.module';
import { DocumentProxyModule } from './proxy/document-proxy.module';

@Module({
  imports: [
    // Load .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Proxy modules
    AuthProxyModule,
    DocumentProxyModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Áp dụng logging cho tất cả request đi qua gateway
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
