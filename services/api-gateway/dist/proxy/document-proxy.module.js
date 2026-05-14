"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentProxyModule = void 0;
const common_1 = require("@nestjs/common");
const document_proxy_controller_1 = require("./document-proxy.controller");
const jwt_middleware_1 = require("../middleware/jwt.middleware");
let DocumentProxyModule = class DocumentProxyModule {
    configure(consumer) {
        consumer
            .apply(jwt_middleware_1.JwtMiddleware)
            .forRoutes(document_proxy_controller_1.DocumentProxyController);
    }
};
exports.DocumentProxyModule = DocumentProxyModule;
exports.DocumentProxyModule = DocumentProxyModule = __decorate([
    (0, common_1.Module)({
        controllers: [document_proxy_controller_1.DocumentProxyController],
    })
], DocumentProxyModule);
//# sourceMappingURL=document-proxy.module.js.map