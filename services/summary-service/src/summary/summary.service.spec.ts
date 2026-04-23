import { Test, TestingModule } from '@nestjs/testing';
import { SummaryService } from './summary.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import axios from 'axios';

// Mock axios vì service đang import nguyên module axios
jest.mock('axios');

describe('SummaryService', () => {
  let service: SummaryService;
  let prismaService: jest.Mocked<PrismaService>;
  let aiService: jest.Mocked<AiService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummaryService,
        {
          // Mock PrismaService
          provide: PrismaService,
          useValue: {
            summary: {
              create: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
        {
          // Mock AiService
          provide: AiService,
          useValue: {
            summarizeText: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
    prismaService = module.get(PrismaService);
    aiService = module.get(AiService);

    // Xóa bộ nhớ các mock trước mỗi test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleDocumentUploaded', () => {
    it('Test 1: Nhận event thành công, extract text (có sẵn ở payload) OK và gọi AI OK', async () => {
      // Đầu vào (nhận event thành công)
      const payload = {
        document_id: 'doc-123',
        extracted_text: 'Đây là nội dung văn bản gốc đã extract.',
      };

      const aiSummaryResponse = '- Ý chính 1\n- Ý chính 2\n- Ý chính 3';

      // Giả lập AI trả về thành công
      aiService.summarizeText.mockResolvedValue(aiSummaryResponse);
      // Giả lập Prisma tạo summary thành công
      (prismaService.summary.create as jest.Mock).mockResolvedValue({
        id: 'sum-123',
        documentId: payload.document_id,
        content: aiSummaryResponse,
      } as any);

      // Thực thi function
      await service.handleDocumentUploaded(payload);

      // Verify (kiểm tra gọi AI OK)
      expect(aiService.summarizeText).toHaveBeenCalledWith(payload.extracted_text);
      expect(aiService.summarizeText).toHaveBeenCalledTimes(1);

      // Verify (kiểm tra lưu DB OK)
      expect(prismaService.summary.create).toHaveBeenCalledWith({
        data: {
          documentId: payload.document_id,
          content: aiSummaryResponse,
        },
      });

      // Verify không gọi document-service bằng Axios vì đã có sẵn text
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('Test 2: Extract text OK (khi thiếu text trong payload phải gọi API phụ) và gọi AI OK', async () => {
      // Đầu vào event không có text
      const payload = {
        document_id: 'doc-456',
        extracted_text: undefined,
      };

      const extractedTextFromService = 'Nội dung trả về từ Document Service api.';
      const aiSummaryResponse = '- Tóm tắt nội dung Document Service';

      // Giả lập Axios lấy text OK (extract text OK)
      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          data: {
            text: extractedTextFromService,
          },
        },
      });

      // Giả lập AI và DB OK
      aiService.summarizeText.mockResolvedValue(aiSummaryResponse);
      (prismaService.summary.create as jest.Mock).mockResolvedValue({
        id: 'sum-456',
        documentId: payload.document_id,
        content: aiSummaryResponse
      } as any);

      // Thực thi
      await service.handleDocumentUploaded(payload);

      // Verify (kiểm tra extract text OK thông qua gọi API phụ)
      expect(axios.post).toHaveBeenCalledWith(`http://localhost:3004/api/documents/${payload.document_id}/extract`);

      // Verify (kiểm tra AI nhận đúng text từ API phụ và chạy OK)
      expect(aiService.summarizeText).toHaveBeenCalledWith(extractedTextFromService);

      // Verify (kiểm tra lưu DB thành công)
      expect(prismaService.summary.create).toHaveBeenCalledWith({
        data: {
          documentId: payload.document_id,
          content: aiSummaryResponse,
        },
      });
    });

    it('Test 3: Dừng xử lý nếu gọi AI gặp lỗi', async () => {
      const payload = {
        document_id: 'doc-789',
        extracted_text: 'Text lỗi',
      };

      // Giả lập AI ném lỗi
      aiService.summarizeText.mockRejectedValue(new Error('AI Rate limit'));

      await service.handleDocumentUploaded(payload);

      expect(aiService.summarizeText).toHaveBeenCalledWith(payload.extracted_text);
      // DB create không được gọi vì AI lỗi
      expect(prismaService.summary.create).not.toHaveBeenCalled();
    });
  });
});
