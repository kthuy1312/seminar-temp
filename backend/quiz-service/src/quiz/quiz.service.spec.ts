import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock GoogleGenerativeAI
const mockGenerateContent = jest.fn();
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      };
    }),
  };
});

describe('QuizService', () => {
  let service: QuizService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    quiz: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    quizAttempt: {
      create: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'GEMINI_API_KEY') return 'test-api-key';
      if (key === 'SUMMARY_SERVICE_URL') return 'http://localhost:3002';
      return null;
    }),
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateQuiz', () => {
    it('should generate a quiz successfully (tạo quiz thành công)', async () => {
      const documentId = 'doc-123';

      // 1. Mock Summary Service trả về summary hợp lệ
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, data: { content: 'Đây là nội dung tóm tắt test.' } },
      });

      // 2. Mock AI trả về JSON hợp lệ
      const mockQuestions = [
        {
          questionText: 'Test question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
          explanation: 'Vì A đúng.',
        },
      ];
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockQuestions),
        },
      });

      // 3. Mock Prisma create
      const mockCreatedQuiz = {
        id: 'quiz-1',
        documentId,
        title: 'Quiz for Document doc-123',
        questions: mockQuestions,
      };
      mockPrismaService.quiz.create.mockResolvedValueOnce(mockCreatedQuiz);

      const result = await service.generateQuiz(documentId);

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledWith(`http://localhost:3002/api/summaries/document/${documentId}`);
      expect(mockGenerateContent).toHaveBeenCalled();
      expect(mockPrismaService.quiz.create).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedQuiz);
    });

    it('should throw InternalServerErrorException when AI returns invalid format (AI trả sai format)', async () => {
      const documentId = 'doc-123';

      // Mock Summary Service
      mockedAxios.get.mockResolvedValue({
        data: { success: true, data: { content: 'Nội dung tóm tắt.' } },
      });

      // Mock AI trả về chuỗi KHÔNG phải JSON
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Chắc chắn rồi, đây là câu hỏi của bạn nhưng tôi không viết bằng JSON',
        },
      });

      // Assert error (lỗi JSON.parse sẽ dẫn tới catch block và ném ra InternalServerErrorException)
      await expect(service.generateQuiz(documentId)).rejects.toThrow('Failed to generate quiz questions');

      // Prisma create KHÔNG được gọi
      expect(mockPrismaService.quiz.create).not.toHaveBeenCalled();
    });
  });

  describe('submitQuiz', () => {
    it('should calculate score and submit quiz successfully (submit quiz)', async () => {
      const quizId = 'quiz-123';
      const userId = 'user-456';

      // Dữ liệu Quiz lấy từ DB
      const mockQuiz = {
        id: quizId,
        questions: [
          { id: 'q1', correctAnswer: 'A' },
          { id: 'q2', correctAnswer: 'B' },
        ],
      };
      mockPrismaService.quiz.findUnique.mockResolvedValueOnce(mockQuiz);

      // Câu trả lời của user (1 đúng, 1 sai)
      const answers = {
        'q1': 'A', // Đúng
        'q2': 'C', // Sai
      };

      // Mock DB create attempt
      const mockAttempt = {
        id: 'attempt-1',
        quizId,
        userId,
        score: 1, // Điểm mong đợi là 1 (vì đúng 1 câu)
        total: 2,
        answers,
      };
      mockPrismaService.quizAttempt.create.mockResolvedValueOnce(mockAttempt);

      const result = await service.submitQuiz(quizId, userId, answers);

      expect(mockPrismaService.quiz.findUnique).toHaveBeenCalledWith({
        where: { id: quizId },
        include: { questions: true },
      });
      expect(mockPrismaService.quizAttempt.create).toHaveBeenCalledWith({
        data: {
          quizId,
          userId,
          score: 1,
          total: 2,
          answers,
        },
      });
      expect(result).toEqual(mockAttempt);
    });
  });
});
