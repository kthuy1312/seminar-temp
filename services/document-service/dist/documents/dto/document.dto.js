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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryDocumentsDto = exports.UploadDocumentDto = exports.MAX_FILE_SIZE_BYTES = exports.ALLOWED_EXTENSIONS = exports.ALLOWED_MIME_TYPES = exports.FileTypeEnum = void 0;
const class_validator_1 = require("class-validator");
var FileTypeEnum;
(function (FileTypeEnum) {
    FileTypeEnum["PDF"] = "pdf";
    FileTypeEnum["DOCX"] = "docx";
})(FileTypeEnum || (exports.FileTypeEnum = FileTypeEnum = {}));
exports.ALLOWED_MIME_TYPES = {
    [FileTypeEnum.PDF]: 'application/pdf',
    [FileTypeEnum.DOCX]: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
exports.ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
exports.MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
class UploadDocumentDto {
}
exports.UploadDocumentDto = UploadDocumentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'userId phải là UUID hợp lệ' }),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "userId", void 0);
class QueryDocumentsDto {
}
exports.QueryDocumentsDto = QueryDocumentsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDocumentsDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FileTypeEnum, { message: 'fileType phải là: pdf, docx' }),
    __metadata("design:type", String)
], QueryDocumentsDto.prototype, "fileType", void 0);
//# sourceMappingURL=document.dto.js.map