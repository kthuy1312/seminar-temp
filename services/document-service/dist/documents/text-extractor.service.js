"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TextExtractorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextExtractorService = exports.TextExtractionError = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth = __importStar(require("mammoth"));
class TextExtractionError extends Error {
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'TextExtractionError';
    }
}
exports.TextExtractionError = TextExtractionError;
let TextExtractorService = TextExtractorService_1 = class TextExtractorService {
    constructor() {
        this.logger = new common_1.Logger(TextExtractorService_1.name);
    }
    async extract(filePath, originalName) {
        const ext = (0, path_1.extname)(originalName).toLowerCase();
        this.logger.debug(`Extracting text from: ${originalName} (${ext})`);
        switch (ext) {
            case '.pdf':
                return this.extractFromPdf(filePath);
            case '.docx':
                return this.extractFromDocx(filePath);
            default:
                throw new common_1.UnprocessableEntityException(`Không hỗ trợ extract text từ định dạng "${ext}". Chỉ hỗ trợ: .pdf, .docx`);
        }
    }
    async extractFromPdf(filePath) {
        let buffer;
        try {
            buffer = await (0, promises_1.readFile)(filePath);
        }
        catch (err) {
            this.logger.error(`Cannot read PDF file at "${filePath}"`, err);
            throw new common_1.UnprocessableEntityException('Không thể đọc file PDF. File có thể đã bị xóa hoặc bị hỏng.');
        }
        try {
            const data = await (0, pdf_parse_1.default)(buffer, {
                pagerender: undefined,
            });
            if (!data.text || data.text.trim().length === 0) {
                this.logger.warn(`PDF "${filePath}" extracted but text is empty (might be scanned/image-based)`);
                throw new common_1.UnprocessableEntityException('File PDF không chứa text có thể đọc được. '
                    + 'File có thể là ảnh scan — cần OCR để xử lý.');
            }
            const cleaned = this.cleanText(data.text);
            this.logger.log(`PDF extracted: ${cleaned.charCount} chars, ${data.numpages} pages`);
            return { ...cleaned, sourceType: 'pdf' };
        }
        catch (err) {
            if (err instanceof common_1.UnprocessableEntityException)
                throw err;
            this.logger.error(`pdf-parse failed for "${filePath}"`, err);
            throw new common_1.UnprocessableEntityException('Không thể parse nội dung PDF. File có thể bị mã hóa hoặc bị lỗi cấu trúc.');
        }
    }
    async extractFromDocx(filePath) {
        let buffer;
        try {
            buffer = await (0, promises_1.readFile)(filePath);
        }
        catch (err) {
            this.logger.error(`Cannot read DOCX file at "${filePath}"`, err);
            throw new common_1.UnprocessableEntityException('Không thể đọc file DOCX. File có thể đã bị xóa hoặc bị hỏng.');
        }
        try {
            const result = await mammoth.extractRawText({ buffer });
            if (result.messages.length > 0) {
                const warnings = result.messages
                    .filter((m) => m.type === 'warning')
                    .map((m) => m.message);
                if (warnings.length > 0) {
                    this.logger.warn(`DOCX warnings for "${filePath}": ${warnings.join('; ')}`);
                }
            }
            if (!result.value || result.value.trim().length === 0) {
                this.logger.warn(`DOCX "${filePath}" extracted but text is empty`);
                throw new common_1.UnprocessableEntityException('File DOCX không chứa nội dung text có thể đọc được.');
            }
            const cleaned = this.cleanText(result.value);
            this.logger.log(`DOCX extracted: ${cleaned.charCount} chars`);
            return { ...cleaned, sourceType: 'docx' };
        }
        catch (err) {
            if (err instanceof common_1.UnprocessableEntityException)
                throw err;
            this.logger.error(`mammoth failed for "${filePath}"`, err);
            throw new common_1.UnprocessableEntityException('Không thể parse nội dung DOCX. File có thể không phải định dạng .docx chuẩn hoặc bị hỏng.');
        }
    }
    cleanText(raw) {
        const text = raw
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .replace(/[^\S\n]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        const lines = text.split('\n');
        return {
            text,
            charCount: text.length,
            lineCount: lines.length,
        };
    }
};
exports.TextExtractorService = TextExtractorService;
exports.TextExtractorService = TextExtractorService = TextExtractorService_1 = __decorate([
    (0, common_1.Injectable)()
], TextExtractorService);
//# sourceMappingURL=text-extractor.service.js.map