import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  // Giả lập (mock) AppService để test controller độc lập
  let mockAppService = {
    getHealth: jest.fn().mockReturnValue('Service is healthy'),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService, // Sử dụng service giả lập
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      // Gọi đúng phương thức getHealth()
      expect(appController.getHealth()).toBe('Service is healthy');
    });
  });
});