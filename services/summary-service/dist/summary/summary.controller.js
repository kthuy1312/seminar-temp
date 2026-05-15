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
exports.SummaryController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const summary_service_1 = require("./summary.service");
let SummaryController = class SummaryController {
    constructor(summaryService) {
        this.summaryService = summaryService;
    }
    async handleDocumentUploadedEvent(data) {
        await this.summaryService.handleDocumentUploaded(data);
    }
    async getSummaryByDocumentId(documentId) {
        return this.summaryService.getSummaryByDocumentId(documentId);
    }
    async generateSummary(body) {
        return this.summaryService.generateSummary(body.documentId, body.force === true);
    }
};
exports.SummaryController = SummaryController;
__decorate([
    (0, microservices_1.EventPattern)('document.uploaded'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SummaryController.prototype, "handleDocumentUploadedEvent", null);
__decorate([
    (0, common_1.Get)('document/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SummaryController.prototype, "getSummaryByDocumentId", null);
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SummaryController.prototype, "generateSummary", null);
exports.SummaryController = SummaryController = __decorate([
    (0, common_1.Controller)('api/summaries'),
    __metadata("design:paramtypes", [summary_service_1.SummaryService])
], SummaryController);
//# sourceMappingURL=summary.controller.js.map