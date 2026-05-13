import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'goal-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
