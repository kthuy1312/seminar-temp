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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SummaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let SummaryService = SummaryService_1 = class SummaryService {
    prisma;
    aiService;
    configService;
    logger = new common_1.Logger(SummaryService_1.name);
    constructor(prisma, aiService, configService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.configService = configService;
    }
    async handleDocumentUploaded(payload) {
        const { document_id, extracted_text } = payload;
        this.logger.log(`Received document.uploaded event for document: ${document_id}`);
        let textToSummarize = extracted_text;
        if (!textToSummarize) {
            this.logger.log(`No extracted text in payload, calling Document Service to extract for ${document_id}`);
            try {
                const documentServiceUrl = process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3003';
                const response = await axios_1.default.post(`${documentServiceUrl}/api/documents/${document_id}/extract`);
                if (response.data?.data?.text) {
                    textToSummarize = response.data.data.text;
                }
                else {
                    throw new Error('No text returned from Document Service');
                }
            }
            catch (error) {
                this.logger.error(`Failed to fetch text from Document Service for ${document_id}`, error);
                return;
            }
        }
        if (!textToSummarize || textToSummarize.trim() === '') {
            this.logger.warn(`Document ${document_id} has empty text. Cannot summarize.`);
            return;
        }
        this.logger.log(`Calling Gemini AI to summarize document ${document_id}...`);
        let summaryContent = '';
        try {
            summaryContent = await this.aiService.summarizeText(textToSummarize);
        }
        catch (error) {
            this.logger.error(`Gemini AI failed for document ${document_id}`, error);
            return;
        }
        try {
            const summary = await this.prisma.summary.create({
                data: {
                    documentId: document_id,
                    content: summaryContent,
                },
            });
            this.logger.log(`Successfully saved summary (id: ${summary.id}) for document ${document_id}`);
        }
        catch (error) {
            this.logger.error(`Failed to save summary to DB for document ${document_id}`, error);
        }
    }
    async generateSummary(documentId) {
        this.logger.log(`Generating summary for document ${documentId} on-demand...`);
        try {
            const existingSummary = await this.prisma.summary.findFirst({
                where: { documentId },
                orderBy: { createdAt: 'desc' },
            });
            if (existingSummary) {
                this.logger.log(`Summary already exists for document ${documentId}, returning existing`);
                return existingSummary;
            }
            const documentServiceUrl = this.configService.get('DOCUMENT_SERVICE_URL') || 'http://localhost:3003';
            const extractResponse = await axios_1.default.post(`${documentServiceUrl}/api/documents/${documentId}/extract`);
            if (!extractResponse.data?.data?.text) {
                throw new Error('No text extracted from document');
            }
            const textToSummarize = extractResponse.data.data.text;
            if (!textToSummarize || textToSummarize.trim() === '') {
                throw new Error('Document has empty text');
            }
            const summaryContent = await this.aiService.summarizeText(textToSummarize);
            const summary = await this.prisma.summary.create({
                data: {
                    documentId,
                    content: summaryContent,
                },
            });
            this.logger.log(`Successfully generated and saved summary for document ${documentId}`);
            return summary;
        }
        catch (error) {
            this.logger.error(`Failed to generate summary for document ${documentId}:`, error);
            throw new common_1.InternalServerErrorException('Failed to generate summary');
        }
    }
    async getSummaryByDocumentId(documentId) {
        const summary = await this.prisma.summary.findFirst({
            where: { documentId },
            orderBy: { createdAt: 'desc' },
        });
        if (!summary) {
            throw new common_1.NotFoundException(`Summary cho document ${documentId} không tồn tại`);
        }
        return summary;
    }
};
exports.SummaryService = SummaryService;
exports.SummaryService = SummaryService = SummaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService,
        config_1.ConfigService])
], SummaryService);
//# sourceMappingURL=summary.service.js.map