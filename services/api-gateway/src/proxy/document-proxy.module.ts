import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { DocumentProxyController } from './document-proxy.controller';
import { JwtMiddleware } from '../middleware/jwt.middleware';

@Module({
  controllers: [DocumentProxyController],
})
export class DocumentProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Tất cả route document đều cần JWT (không có public route)
    consumer
      .apply(JwtMiddleware)
      .forRoutes(DocumentProxyController);
  }
}
