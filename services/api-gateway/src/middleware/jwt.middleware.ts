import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

/**
 * JWT Middleware
 * Xác thực JWT token từ header Authorization: Bearer <token>
 * Nếu token hợp lệ → gắn user payload vào req.user và forward tiếp
 * Nếu token không hợp lệ → trả về 401
 */
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private readonly logger = new Logger('JwtMiddleware');
  private readonly jwtSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.jwtSecret = this.configService.get<string>('JWT_ACCESS_SECRET', 'JUSTASECRET');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization format. Expected: Bearer <token>');
    }

    try {
      const payload = jwt.verify(token, this.jwtSecret);
      // Gắn user info vào request để downstream service có thể dùng
      (req as any).user = payload;

      // Forward userId qua header để downstream service không cần decode JWT lại
      const userId = (payload as any).sub || (payload as any).id;
      if (userId) {
        req.headers['x-user-id'] = userId;
      }

      this.logger.debug(`JWT verified for user: ${userId}`);
      next();
    } catch (error) {
      this.logger.warn(`JWT verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
