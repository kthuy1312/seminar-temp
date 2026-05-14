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
exports.GoalProxyController = exports.TutorProxyController = exports.QuizProxyController = exports.SummaryProxyController = exports.DashboardProxyController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const proxy_utils_1 = require("./proxy.utils");
let DashboardProxyController = class DashboardProxyController {
    constructor(configService) {
        this.configService = configService;
        const built = (0, proxy_utils_1.buildProxy)(this.configService, {
            envKey: 'DASHBOARD_SERVICE_URL',
            fallback: 'http://localhost:3002',
            proxyName: 'DashboardProxy',
            unavailableMessage: 'Dashboard service unavailable',
        });
        this.logger = built.logger;
        this.proxy = built.proxy;
    }
    forward(req, res) {
        this.proxy(req, res, (err) => {
            (0, proxy_utils_1.handleProxyError)(this.logger, res, err, 'Dashboard service unavailable');
        });
    }
    proxyRoot(req, res) {
        this.forward(req, res);
    }
    proxyNested(req, res) {
        this.forward(req, res);
    }
};
exports.DashboardProxyController = DashboardProxyController;
__decorate([
    (0, common_1.All)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DashboardProxyController.prototype, "proxyRoot", null);
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DashboardProxyController.prototype, "proxyNested", null);
exports.DashboardProxyController = DashboardProxyController = __decorate([
    (0, common_1.Controller)('api/dashboard'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DashboardProxyController);
let SummaryProxyController = class SummaryProxyController {
    constructor(configService) {
        this.configService = configService;
        const built = (0, proxy_utils_1.buildProxy)(this.configService, {
            envKey: 'SUMMARY_SERVICE_URL',
            fallback: 'http://localhost:3005',
            proxyName: 'SummaryProxy',
            unavailableMessage: 'Summary service unavailable',
        });
        this.logger = built.logger;
        this.proxy = built.proxy;
    }
    forward(req, res) {
        this.proxy(req, res, (err) => {
            (0, proxy_utils_1.handleProxyError)(this.logger, res, err, 'Summary service unavailable');
        });
    }
    proxyRoot(req, res) {
        this.forward(req, res);
    }
    proxyNested(req, res) {
        this.forward(req, res);
    }
};
exports.SummaryProxyController = SummaryProxyController;
__decorate([
    (0, common_1.All)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SummaryProxyController.prototype, "proxyRoot", null);
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SummaryProxyController.prototype, "proxyNested", null);
exports.SummaryProxyController = SummaryProxyController = __decorate([
    (0, common_1.Controller)('api/summaries'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SummaryProxyController);
let QuizProxyController = class QuizProxyController {
    constructor(configService) {
        this.configService = configService;
        const built = (0, proxy_utils_1.buildProxy)(this.configService, {
            envKey: 'QUIZ_SERVICE_URL',
            fallback: 'http://localhost:3005',
            proxyName: 'QuizProxy',
            unavailableMessage: 'Quiz service unavailable',
        });
        this.logger = built.logger;
        this.proxy = built.proxy;
    }
    forward(req, res) {
        this.proxy(req, res, (err) => {
            (0, proxy_utils_1.handleProxyError)(this.logger, res, err, 'Quiz service unavailable');
        });
    }
    proxyRoot(req, res) {
        this.forward(req, res);
    }
    proxyNested(req, res) {
        this.forward(req, res);
    }
};
exports.QuizProxyController = QuizProxyController;
__decorate([
    (0, common_1.All)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], QuizProxyController.prototype, "proxyRoot", null);
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], QuizProxyController.prototype, "proxyNested", null);
exports.QuizProxyController = QuizProxyController = __decorate([
    (0, common_1.Controller)('api/quiz'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QuizProxyController);
let TutorProxyController = class TutorProxyController {
    constructor(configService) {
        this.configService = configService;
        const built = (0, proxy_utils_1.buildProxy)(this.configService, {
            envKey: 'TUTOR_SERVICE_URL',
            fallback: 'http://localhost:3007',
            proxyName: 'TutorProxy',
            unavailableMessage: 'Tutor service unavailable',
        });
        this.logger = built.logger;
        this.proxy = built.proxy;
    }
    forward(req, res) {
        this.proxy(req, res, (err) => {
            (0, proxy_utils_1.handleProxyError)(this.logger, res, err, 'Tutor service unavailable');
        });
    }
    proxyRoot(req, res) {
        this.forward(req, res);
    }
    proxyNested(req, res) {
        this.forward(req, res);
    }
};
exports.TutorProxyController = TutorProxyController;
__decorate([
    (0, common_1.All)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TutorProxyController.prototype, "proxyRoot", null);
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TutorProxyController.prototype, "proxyNested", null);
exports.TutorProxyController = TutorProxyController = __decorate([
    (0, common_1.Controller)('api/tutor'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TutorProxyController);
let GoalProxyController = class GoalProxyController {
    constructor(configService) {
        this.configService = configService;
        const built = (0, proxy_utils_1.buildProxy)(this.configService, {
            envKey: 'GOAL_SERVICE_URL',
            fallback: 'http://localhost:3004',
            proxyName: 'GoalProxy',
            unavailableMessage: 'Goal service unavailable',
        });
        this.logger = built.logger;
        this.proxy = built.proxy;
    }
    forward(req, res) {
        this.proxy(req, res, (err) => {
            (0, proxy_utils_1.handleProxyError)(this.logger, res, err, 'Goal service unavailable');
        });
    }
    proxyRoot(req, res) {
        this.forward(req, res);
    }
    proxyNested(req, res) {
        this.forward(req, res);
    }
};
exports.GoalProxyController = GoalProxyController;
__decorate([
    (0, common_1.All)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], GoalProxyController.prototype, "proxyRoot", null);
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], GoalProxyController.prototype, "proxyNested", null);
exports.GoalProxyController = GoalProxyController = __decorate([
    (0, common_1.Controller)('api/goals'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoalProxyController);
//# sourceMappingURL=learning-proxy.controller.js.map