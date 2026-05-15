import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private readonly logger = new Logger('JwtMiddleware');

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.decode(token);
        if (decoded && decoded.sub) {
          // Gắn userId vào header để microservices phía sau có thể dùng
          req.headers['x-user-id'] = decoded.sub;
          req.headers['x-user-email'] = decoded.email;
          req.headers['x-user-role'] = decoded.role;
        }
      } catch (error) {
        this.logger.warn('Failed to decode JWT token');
      }
    }

    next();
  }
}
