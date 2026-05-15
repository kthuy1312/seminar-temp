"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TextExtractorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextExtractorService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const pdf_parse_1 = require("pdf-parse");
const mammoth = require("mammoth");
let TextExtractorService = TextExtractorService_1 = class TextExtractorService {
    constructor() {
        this.logger = new common_1.Logger(TextExtractorService_1.name);
    }
    async extract(filePath, fileName) {
        const ext = (0, path_1.extname)(fileName).toLowerCase();
        let buffer;
        try {
            buffer = await (0, promises_1.readFile)(filePath);
        }
        catch (error) {
            this.logger.error(`Cannot read file at: ${filePath}`, error);
            throw new common_1.UnprocessableEntityException(`Không thể đọc file tại đường dẫn: ${filePath}`);
        }
        let text = '';
        let sourceType = '';
        try {
            if (ext === '.pdf') {
                sourceType = 'PDF';
                const pdfData = await (0, pdf_parse_1.default)(buffer, { pagerender: undefined });
                text = pdfData.text;
            }
            else if (ext === '.docx') {
                sourceType = 'DOCX';
                const docxData = await mammoth.extractRawText({ buffer });
                text = docxData.value;
            }
            else if (ext === '.txt') {
                sourceType = 'TXT';
                text = buffer.toString('utf8');
            }
            else {
                throw new common_1.UnprocessableEntityException(`Định dạng không hỗ trợ: ${ext}`);
            }
            const cleanText = text.replace(/\r\n/g, '\n').trim();
            return {
                text: cleanText,
                charCount: cleanText.length,
                lineCount: cleanText.split('\n').length,
                sourceType,
            };
        }
        catch (error) {
            this.logger.error(`Error parsing ${sourceType} file: ${fileName}`, error);
            throw new common_1.UnprocessableEntityException(`Lỗi khi trích xuất văn bản từ file ${sourceType}`);
        }
    }
};
exports.TextExtractorService = TextExtractorService;
exports.TextExtractorService = TextExtractorService = TextExtractorService_1 = __decorate([
    (0, common_1.Injectable)()
], TextExtractorService);
//# sourceMappingURL=text-extractor.service.js.map