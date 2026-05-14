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
exports.DocumentProxyController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const proxy_utils_1 = require("./proxy.utils");
let DocumentProxyController = class DocumentProxyController {
    constructor(configService) {
        this.configService = configService;
        const built = (0, proxy_utils_1.buildProxy)(this.configService, {
            envKey: 'DOCUMENT_SERVICE_URL',
            fallback: 'http://localhost:3003',
            proxyName: 'DocumentProxy',
            unavailableMessage: 'Document service unavailable',
        });
        this.logger = built.logger;
        this.proxy = built.proxy;
    }
    forward(req, res) {
        this.proxy(req, res, (err) => {
            (0, proxy_utils_1.handleProxyError)(this.logger, res, err, 'Document service unavailable');
        });
    }
    proxyRoot(req, res) {
        this.forward(req, res);
    }
    proxyNested(req, res) {
        this.forward(req, res);
    }
};
exports.DocumentProxyController = DocumentProxyController;
__decorate([
    (0, common_1.All)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DocumentProxyController.prototype, "proxyRoot", null);
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DocumentProxyController.prototype, "proxyNested", null);
exports.DocumentProxyController = DocumentProxyController = __decorate([
    (0, common_1.Controller)('api/documents'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DocumentProxyController);
//# sourceMappingURL=document-proxy.controller.js.map