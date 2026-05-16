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
var SummaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let SummaryService = SummaryService_1 = class SummaryService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(SummaryService_1.name);
    }
    async handleDocumentUploaded(payload) {
        const { document_id } = payload;
        this.logger.log(`[summary] document.uploaded ${document_id} — processing handled by document-service`);
        await this.syncSummaryFromDocument(document_id);
    }
    async generateSummary(documentId, force = false) {
        this.logger.log(`[summary] sync from document ${documentId} (force=${force})`);
        if (force) {
            await this.triggerDocumentReprocess(documentId, true);
        }
        return this.syncSummaryFromDocument(documentId, force);
    }
    async getSummaryByDocumentId(documentId) {
        const existing = await this.prisma.summary.findFirst({
            where: { documentId },
            orderBy: { createdAt: 'desc' },
        });
        if (existing?.content) {
            return existing;
        }
        return this.syncSummaryFromDocument(documentId);
    }
    async syncSummaryFromDocument(documentId, force = false) {
        const documentServiceUrl = this.configService.get('DOCUMENT_SERVICE_URL') ||
            'http://localhost:3003';
        let doc = null;
        try {
            const res = await axios_1.default.get(`${documentServiceUrl}/api/documents/${documentId}`, {
                timeout: 15000,
            });
            doc = res.data?.data ?? res.data;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`[summary] fetch document failed: ${message}`);
        }
        const status = doc?.status;
        if (status === 'PROCESSING' || status === 'UPLOADING') {
            throw new common_1.BadRequestException('Tài liệu đang được xử lý. Vui lòng đợi vài giây rồi tải lại trang.');
        }
        let analysis = doc?.aiAnalysis ?? null;
        if (!analysis?.summary) {
            try {
                const analysisRes = await axios_1.default.get(`${documentServiceUrl}/api/documents/${documentId}/ai-analysis`, { timeout: 15000 });
                analysis = analysisRes.data?.data ?? analysisRes.data;
            }
            catch {
                analysis = null;
            }
        }
        const content = analysis?.summary?.trim();
        if (!content) {
            if (status === 'FAILED') {
                throw new common_1.BadRequestException(doc?.processingError ||
                    'Xử lý tài liệu thất bại. Hệ thống vẫn cho phép xem nội dung và dùng chế độ cục bộ.');
            }
            throw new common_1.NotFoundException(`Chưa có phân tích cho document ${documentId}. Đợi trạng thái READY.`);
        }
        if (force) {
            await this.prisma.summary.deleteMany({ where: { documentId } });
        }
        const existing = await this.prisma.summary.findFirst({
            where: { documentId },
            orderBy: { createdAt: 'desc' },
        });
        if (existing && !force) {
            if (existing.content !== content) {
                return this.prisma.summary.update({
                    where: { id: existing.id },
                    data: { content },
                });
            }
            return existing;
        }
        const summary = await this.prisma.summary.create({
            data: { documentId, content },
        });
        this.logger.log(`[summary] synced document ${documentId} source=${doc?.aiSource ?? 'document'}`);
        return summary;
    }
    async triggerDocumentReprocess(documentId, forceAi) {
        const documentServiceUrl = this.configService.get('DOCUMENT_SERVICE_URL') ||
            'http://localhost:3003';
        try {
            await axios_1.default.post(`${documentServiceUrl}/api/documents/${documentId}/reprocess`, { forceAi }, { timeout: 120000 });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`[summary] reprocess trigger failed: ${message}`);
        }
    }
};
exports.SummaryService = SummaryService;
exports.SummaryService = SummaryService = SummaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], SummaryService);
//# sourceMappingURL=summary.service.js.map