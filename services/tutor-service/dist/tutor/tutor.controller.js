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
exports.TutorController = void 0;
const common_1 = require("@nestjs/common");
const tutor_service_1 = require("./tutor.service");
const ask_dto_1 = require("./dto/ask.dto");
let TutorController = class TutorController {
    tutorService;
    constructor(tutorService) {
        this.tutorService = tutorService;
    }
    async askQuestion(askDto) {
        return this.tutorService.askQuestion(askDto);
    }
    async getHistory(userId, documentId, skip, take) {
        return this.tutorService.getHistory(userId, documentId, parseInt(skip || '0'), parseInt(take || '10'));
    }
};
exports.TutorController = TutorController;
__decorate([
    (0, common_1.Post)('ask'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ask_dto_1.AskDto]),
    __metadata("design:returntype", Promise)
], TutorController.prototype, "askQuestion", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Query)('documentId')),
    __param(2, (0, common_1.Query)('skip')),
    __param(3, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TutorController.prototype, "getHistory", null);
exports.TutorController = TutorController = __decorate([
    (0, common_1.Controller)('api/tutor'),
    __metadata("design:paramtypes", [tutor_service_1.TutorService])
], TutorController);
//# sourceMappingURL=tutor.controller.js.map