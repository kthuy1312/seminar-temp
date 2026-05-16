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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const documents_service_1 = require("./documents.service");
const documents_dto_1 = require("./dto/documents.dto");
const documents_dto_2 = require("./dto/documents.dto");
const storage = (0, multer_1.diskStorage)({
    destination: (0, path_1.join)(process.cwd(), 'uploads'),
    filename: (_req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname).toLowerCase()}`;
        cb(null, uniqueName);
    },
});
const ALLOWED_MIMES = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
]);
const fileFilter = (_req, file, cb) => {
    const ext = (0, path_1.extname)(file.originalname).toLowerCase();
    if (!documents_dto_2.ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMES.has(file.mimetype)) {
        return cb(new common_1.UnsupportedMediaTypeException(`Chỉ chấp nhận file PDF hoặc DOCX. Bạn upload: "${file.originalname}"`), false);
    }
    cb(null, true);
};
let DocumentsController = class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async upload(file, body, headerUserId) {
        if (!file) {
            throw new common_1.BadRequestException('File không được để trống hoặc định dạng không được hỗ trợ (chỉ chấp nhận PDF, DOCX).');
        }
        return this.documentsService.upload(file, body.userId || headerUserId);
    }
    async extractText(id) {
        return this.documentsService.extractText(id);
    }
    async findAll(query, headerUserId) {
        return this.documentsService.findAll({
            ...query,
            userId: query.userId || headerUserId,
        });
    }
    async getStatus(id) {
        return this.documentsService.getProcessingStatus(id);
    }
    async getAiAnalysis(id) {
        return this.documentsService.getAiAnalysis(id);
    }
    async reprocess(id, body) {
        return this.documentsService.reprocess(id, body?.forceAi === true);
    }
    async findOne(id) {
        return this.documentsService.findOne(id);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage,
        fileFilter,
        limits: {
            fileSize: documents_dto_2.MAX_FILE_SIZE_BYTES,
            files: 1,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, documents_dto_1.UploadDocumentDto, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)(':id/extract'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "extractText", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [documents_dto_1.QueryDocumentsDto, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)(':id/ai-analysis'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getAiAnalysis", null);
__decorate([
    (0, common_1.Post)(':id/reprocess'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "reprocess", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "findOne", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map