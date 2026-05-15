"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DocumentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const path_1 = require("path");
const text_extractor_service_1 = require("./text-extractor.service");
let DocumentsService = DocumentsService_1 = class DocumentsService {
    constructor(prisma, textExtractor, rabbitClient) {
        this.prisma = prisma;
        this.textExtractor = textExtractor;
        this.rabbitClient = rabbitClient;
        this.logger = new common_1.Logger(DocumentsService_1.name);
        this.ALLOWED_TYPES = [
            client_1.FileType.pdf,
            client_1.FileType.docx,
        ];
    }
    async upload(file, userId) {
        if (!file) {
            throw new common_1.BadRequestException('File không được để trống');
        }
        const ext = (0, path_1.extname)(file.originalname).toLowerCase().replace('.', '');
        if (!this.ALLOWED_TYPES.includes(ext)) {
            throw new common_1.BadRequestException(`Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${this.ALLOWED_TYPES.join(', ')}`);
        }
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            throw new common_1.BadRequestException(`File quá lớn. Kích thước tối đa cho phép là 10 MB (bạn upload: ${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        }
        let extractedText = null;
        try {
            this.logger.log(`Auto-extracting text for: ${file.originalname}`);
            const extractResult = await this.textExtractor.extract(file.path, file.originalname);
            extractedText = extractResult.text;
        }
        catch (err) {
            this.logger.warn(`Failed to auto-extract text for ${file.originalname} (file might be scanned/corrupted). Continuing upload.`);
        }
        try {
            const document = await this.prisma.document.create({
                data: {
                    userId: userId ?? null,
                    fileName: file.originalname,
                    fileType: ext,
                    filePath: file.path,
                    fileSize: BigInt(file.size),
                    extractedText,
                },
            });
            this.logger.log(`Document uploaded: ${document.fileName} (id=${document.id}, size=${file.size}B)`);
            this.rabbitClient.emit('document.uploaded', {
                document_id: document.id,
                extracted_text: extractedText,
            });
            this.logger.log(`Published event 'document.uploaded' for document: ${document.id}`);
            return this.serializeDocument(document, file.filename);
        }
        catch (err) {
            this.logger.error('Failed to save document metadata', err);
            throw new common_1.InternalServerErrorException('Không thể lưu thông tin file vào cơ sở dữ liệu');
        }
    }
    async findAll(query) {
        const where = {};
        if (query.userId) {
            where['userId'] = query.userId;
        }
        if (query.fileType) {
            where['fileType'] = query.fileType;
        }
        const documents = await this.prisma.document.findMany({
            where,
            orderBy: { uploadedAt: 'desc' },
        });
        return documents.map((doc) => this.serializeDocument(doc));
    }
    async extractText(id) {
        const document = await this.prisma.document.findUnique({ where: { id } });
        if (!document) {
            throw new common_1.NotFoundException(`Document với id "${id}" không tồn tại`);
        }
        if (document.extractedText) {
            this.logger.log(`Using existing extracted text for document: ${id}`);
            return {
                text: document.extractedText,
                charCount: document.extractedText.length,
                lineCount: document.extractedText.split('\n').length,
                sourceType: document.fileName.endsWith('.pdf') ? 'pdf' : 'docx'
            };
        }
        const result = await this.textExtractor.extract(document.filePath, document.fileName);
        await this.prisma.document.update({
            where: { id },
            data: { extractedText: result.text },
        });
        return result;
    }
    async findOne(id) {
        const document = await this.prisma.document.findUnique({
            where: { id },
        });
        if (!document) {
            throw new common_1.NotFoundException(`Document với id "${id}" không tồn tại`);
        }
        return this.serializeDocument(document);
    }
    serializeDocument(doc, storedFilename) {
        const filename = storedFilename ?? doc.filePath?.split(/[\\/]/).pop() ?? '';
        const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
        return {
            id: doc.id,
            userId: doc.userId,
            fileName: doc.fileName,
            fileType: doc.fileType,
            fileSize: Number(doc.fileSize),
            fileSizeFormatted: this.formatBytes(Number(doc.fileSize)),
            url: `${baseUrl}/api/documents/files/${filename}`,
            uploadedAt: doc.uploadedAt,
        };
    }
    formatBytes(bytes) {
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = DocumentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)('RABBITMQ_CLIENT')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        text_extractor_service_1.TextExtractorService,
        microservices_1.ClientProxy])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map