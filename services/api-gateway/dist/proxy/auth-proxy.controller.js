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
exports.AuthProxyController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const proxy_utils_1 = require("./proxy.utils");
let AuthProxyController = class AuthProxyController {
    constructor(configService) {
        this.configService = configService;
        const built = (0, proxy_utils_1.buildProxy)(this.configService, {
            envKey: 'AUTH_SERVICE_URL',
            fallback: 'http://localhost:3001',
            proxyName: 'AuthProxy',
            unavailableMessage: 'Auth service unavailable',
        });
        this.logger = built.logger;
        this.proxy = built.proxy;
    }
    async proxy_request(req, res) {
        this.proxy(req, res, (err) => {
            (0, proxy_utils_1.handleProxyError)(this.logger, res, err, 'Auth service unavailable');
        });
    }
};
exports.AuthProxyController = AuthProxyController;
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthProxyController.prototype, "proxy_request", null);
exports.AuthProxyController = AuthProxyController = __decorate([
    (0, common_1.Controller)('api/auth'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AuthProxyController);
//# sourceMappingURL=auth-proxy.controller.js.map