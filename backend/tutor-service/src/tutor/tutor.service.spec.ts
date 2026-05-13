import { Test, TestingModule } from '@nestjs/testing';
import { TutorService } from './tutor.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { of } from 'rxjs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the GoogleGenerativeAI module
jest.mock('@google/generative-ai');

describe('TutorService', () => {
  let service: TutorService;
  let prismaService: PrismaService;
  let httpService: HttpService;
  let mockGenAIModel: any;

  // Setup mock providers
  const mockPrismaService = {
    conversation: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'GEMINI_API_KEY') return 'test-api-key';
      if (key === 'SUMMARY_SERVICE_URL') return 'http://localhost:3002';
      return null;
    }),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Xóa bộ đệm mock trước mỗi test
    jest.clearAllMocks();

    // Khởi tạo mock Model cho AI
    mockGenAIModel = {
      generateContent: jest.fn(),
    };
    
    // Chèn mock vào Constructor của GoogleGenerativeAI
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue(mockGenAIModel),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<TutorService>(TutorService);
    prismaService = module.get<PrismaService>(PrismaService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('askQuestion', () => {
    const askDto = {
      question: 'Ví dụ về NestJS?',
      documentId: 'doc-123',
    };

    it('1. Hỏi câu hỏi hợp lệ (thành công gọi AI và lưu DB)', async () => {
      // Mock HTTP response trả về summary
      const mockSummary = 'NestJS là một Node.js framework.';
      jest.spyOn(httpService, 'get').mockReturnValue(of({ data: { summary: mockSummary } }) as any);

      // Mock DB tạo Conversation và Message
      const mockConversation = { id: 'conv-1', documentId: 'doc-123', messages: [] };
      mockPrismaService.conversation.create.mockResolvedValue(mockConversation);
      mockPrismaService.message.create.mockResolvedValue({ id: 'msg-ai', content: 'Câu trả lời của AI' });

      // Mock AI trả về text
      mockGenAIModel.generateContent.mockResolvedValue({
        response: { text: () => 'Câu trả lời của AI' },
      });

      const result = await service.askQuestion(askDto);

      // Verify các hành vi
      expect(httpService.get).toHaveBeenCalledWith('http://localhost:3002/summaries/doc-123');
      expect(mockPrismaService.conversation.create).toHaveBeenCalledWith({ data: { documentId: 'doc-123' }, include: { messages: true } });
      expect(mockPrismaService.message.create).toHaveBeenCalledTimes(2); // 1 cho user, 1 cho ai
      expect(mockGenAIModel.generateContent).toHaveBeenCalled();
      expect(result).toEqual({ conversationId: 'conv-1', answer: 'Câu trả lời của AI' });
    });

    it('2. Summary rỗng (ném ra lỗi NotFoundException)', async () => {
      // Mock HTTP response trả về {} (không có summary)
      jest.spyOn(httpService, 'get').mockReturnValue(of({ data: {} }) as any);

      // Đảm bảo rằng hàm ném ra lỗi NotFoundException
      await expect(service.askQuestion(askDto)).rejects.toThrow(NotFoundException);
      
      // Đảm bảo rằng AI và DB không bị gọi
      expect(mockPrismaService.conversation.create).not.toHaveBeenCalled();
      expect(mockGenAIModel.generateContent).not.toHaveBeenCalled();
    });

    it('3. AI bị lỗi (ném ra lỗi InternalServerErrorException)', async () => {
      // Mock có Summary
      const mockSummary = 'NestJS là một Node.js framework.';
      jest.spyOn(httpService, 'get').mockReturnValue(of({ data: { summary: mockSummary } }) as any);

      // Mock DB
      const mockConversation = { id: 'conv-1', documentId: 'doc-123', messages: [] };
      mockPrismaService.conversation.create.mockResolvedValue(mockConversation);
      // Chỉ thành công việc tạo User Message
      mockPrismaService.message.create.mockResolvedValueOnce({ id: 'msg-user', content: askDto.question });

      // Mock AI ném ra lỗi (ví dụ: hết quota hoặc mất mạng)
      mockGenAIModel.generateContent.mockRejectedValue(new Error('AI API Error'));

      await expect(service.askQuestion(askDto)).rejects.toThrow(InternalServerErrorException);
      
      // User message được lưu, nhưng AI message chưa được tạo (chỉ gọi 1 lần)
      expect(mockPrismaService.message.create).toHaveBeenCalledTimes(1);
    });
  });
});
