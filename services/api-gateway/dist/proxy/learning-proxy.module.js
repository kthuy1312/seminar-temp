"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningProxyModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_middleware_1 = require("../middleware/jwt.middleware");
const learning_proxy_controller_1 = require("./learning-proxy.controller");
let LearningProxyModule = class LearningProxyModule {
    configure(consumer) {
        consumer
            .apply(jwt_middleware_1.JwtMiddleware)
            .forRoutes(learning_proxy_controller_1.DashboardProxyController, learning_proxy_controller_1.SummaryProxyController, learning_proxy_controller_1.QuizProxyController, learning_proxy_controller_1.TutorProxyController, learning_proxy_controller_1.GoalProxyController);
    }
};
exports.LearningProxyModule = LearningProxyModule;
exports.LearningProxyModule = LearningProxyModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            learning_proxy_controller_1.DashboardProxyController,
            learning_proxy_controller_1.SummaryProxyController,
            learning_proxy_controller_1.QuizProxyController,
            learning_proxy_controller_1.TutorProxyController,
            learning_proxy_controller_1.GoalProxyController,
        ],
    })
], LearningProxyModule);
//# sourceMappingURL=learning-proxy.module.js.map