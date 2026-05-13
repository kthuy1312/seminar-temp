import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { TextExtractorService } from './text-extractor.service';
import { BadRequestException } from '@nestjs/common';
import { FileType } from '@prisma/client';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prismaService: PrismaService;
  let textExtractorService: TextExtractorService;
  let rabbitClient: any;

  // Mock dependencies
  const mockPrismaService = {
    document: {
      create: jest.fn(),
    },
  };

  const mockTextExtractorService = {
    extract: jest.fn(),
  };

  const mockRabbitClient = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TextExtractorService,
          useValue: mockTextExtractorService,
        },
        {
          provide: 'RABBITMQ_CLIENT',
          useValue: mockRabbitClient,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prismaService = module.get<PrismaService>(PrismaService);
    textExtractorService = module.get<TextExtractorService>(TextExtractorService);
    rabbitClient = module.get('RABBITMQ_CLIENT');

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('1. Upload thành công (successful upload)', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 5 * 1024 * 1024, // 5MB
        destination: './uploads',
        filename: 'uuid-test.pdf',
        path: 'uploads/uuid-test.pdf',
        buffer: Buffer.from('test'),
        stream: null as any,
      };

      const mockExtractedText = 'This is extracted text from the PDF.';
      mockTextExtractorService.extract.mockResolvedValue({
        text: mockExtractedText,
        charCount: 36,
        lineCount: 1,
        sourceType: 'pdf',
      });

      const mockCreatedDocument = {
        id: 'doc-uuid-123',
        userId: 'user-uuid-456',
        fileName: mockFile.originalname,
        fileType: FileType.pdf,
        filePath: mockFile.path,
        fileSize: BigInt(mockFile.size),
        extractedText: mockExtractedText,
        uploadedAt: new Date(),
      };

      mockPrismaService.document.create.mockResolvedValue(mockCreatedDocument);

      const result = await service.upload(mockFile, 'user-uuid-456');

      // Verify Text Extractor was called
      expect(mockTextExtractorService.extract).toHaveBeenCalledWith(
        mockFile.path,
        mockFile.originalname,
      );

      // Verify DB Create was called with correct data
      expect(mockPrismaService.document.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid-456',
          fileName: mockFile.originalname,
          fileType: 'pdf',
          filePath: mockFile.path,
          fileSize: BigInt(mockFile.size),
          extractedText: mockExtractedText,
        },
      });

      // Verify RabbitMQ Event was emitted
      expect(mockRabbitClient.emit).toHaveBeenCalledWith('document.uploaded', {
        document_id: mockCreatedDocument.id,
        extracted_text: mockExtractedText,
      });

      // Verify Result
      expect(result).toBeDefined();
      expect(result.id).toEqual(mockCreatedDocument.id);
      expect(result.url).toContain('uuid-test.pdf'); // Check if generated URL contains filename
    });

    it('2. Sai file type (wrong file type - throw BadRequestException)', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.exe', // Định dạng không được phép
        encoding: '7bit',
        mimetype: 'application/x-msdownload',
        size: 1024,
        destination: './uploads',
        filename: 'uuid-test.exe',
        path: 'uploads/uuid-test.exe',
        buffer: Buffer.from('test'),
        stream: null as any,
      };

      await expect(service.upload(mockFile, 'user-uuid')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.upload(mockFile, 'user-uuid')).rejects.toThrow(
        /Định dạng file không được hỗ trợ/,
      );

      // Verify dependencies were NOT called
      expect(mockTextExtractorService.extract).not.toHaveBeenCalled();
      expect(mockPrismaService.document.create).not.toHaveBeenCalled();
      expect(mockRabbitClient.emit).not.toHaveBeenCalled();
    });

    it('3. File quá lớn (file too large - throw BadRequestException)', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'large-file.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 15 * 1024 * 1024, // 15MB (>10MB)
        destination: './uploads',
        filename: 'uuid-large.pdf',
        path: 'uploads/uuid-large.pdf',
        buffer: Buffer.from('test'),
        stream: null as any,
      };

      await expect(service.upload(mockFile, 'user-uuid')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.upload(mockFile, 'user-uuid')).rejects.toThrow(
        /File quá lớn/,
      );

      // Verify dependencies were NOT called
      expect(mockTextExtractorService.extract).not.toHaveBeenCalled();
      expect(mockPrismaService.document.create).not.toHaveBeenCalled();
      expect(mockRabbitClient.emit).not.toHaveBeenCalled();
    });

    it('Upload thành công nhưng extract text thất bại (vẫn lưu vào DB với extractedText=null)', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'scanned.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 5 * 1024 * 1024, // 5MB
        destination: './uploads',
        filename: 'uuid-scanned.pdf',
        path: 'uploads/uuid-scanned.pdf',
        buffer: Buffer.from('test'),
        stream: null as any,
      };

      // Mock extractor to throw an error (e.g. Scanned PDF)
      mockTextExtractorService.extract.mockRejectedValue(new Error('Cannot extract text'));

      const mockCreatedDocument = {
        id: 'doc-uuid-123',
        userId: 'user-uuid-456',
        fileName: mockFile.originalname,
        fileType: FileType.pdf,
        filePath: mockFile.path,
        fileSize: BigInt(mockFile.size),
        extractedText: null,
        uploadedAt: new Date(),
      };

      mockPrismaService.document.create.mockResolvedValue(mockCreatedDocument);

      const result = await service.upload(mockFile, 'user-uuid-456');

      // Verify DB Create was called with extractedText: null
      expect(mockPrismaService.document.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid-456',
          fileName: mockFile.originalname,
          fileType: 'pdf',
          filePath: mockFile.path,
          fileSize: BigInt(mockFile.size),
          extractedText: null, // Should be null due to extraction failure
        },
      });

      // Verify RabbitMQ Event was emitted with null extracted_text
      expect(mockRabbitClient.emit).toHaveBeenCalledWith('document.uploaded', {
        document_id: mockCreatedDocument.id,
        extracted_text: null,
      });

      expect(result).toBeDefined();
    });
  });
});
