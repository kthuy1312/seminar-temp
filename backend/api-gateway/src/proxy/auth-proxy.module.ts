import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthProxyController } from './auth-proxy.controller';
import { JwtMiddleware } from '../middleware/jwt.middleware';

@Module({
  controllers: [AuthProxyController],
})
export class AuthProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Áp dụng JWT middleware cho các route CẦN xác thực
    // Bỏ qua: register, login, refresh (public routes)
    consumer
      .apply(JwtMiddleware)
      .exclude(
        { path: 'api/auth/register', method: RequestMethod.POST },
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/auth/refresh', method: RequestMethod.POST },
      )
      .forRoutes(AuthProxyController);
  }
}
