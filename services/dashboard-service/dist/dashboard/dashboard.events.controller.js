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
var DashboardEventsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardEventsController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const dashboard_service_1 = require("./dashboard.service");
const document_uploaded_event_dto_1 = require("./dto/events/document-uploaded-event.dto");
const goal_completed_event_dto_1 = require("./dto/events/goal-completed-event.dto");
const goal_created_event_dto_1 = require("./dto/events/goal-created-event.dto");
const quiz_completed_event_dto_1 = require("./dto/events/quiz-completed-event.dto");
const roadmap_step_completed_event_dto_1 = require("./dto/events/roadmap-step-completed-event.dto");
const summary_created_event_dto_1 = require("./dto/events/summary-created-event.dto");
const user_created_event_dto_1 = require("./dto/events/user-created-event.dto");
let DashboardEventsController = DashboardEventsController_1 = class DashboardEventsController {
    dashboardService;
    logger = new common_1.Logger(DashboardEventsController_1.name);
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async onUserCreated(payload) {
        this.logger.debug(`Received user.created for user ${payload.user_id}`);
        await this.dashboardService.handleUserCreated(payload);
    }
    async onGoalCreated(payload) {
        this.logger.debug(`Received goal.created for user ${payload.user_id}`);
        await this.dashboardService.handleGoalCreated(payload);
    }
    async onGoalCompleted(payload) {
        this.logger.debug(`Received goal.completed for user ${payload.user_id}`);
        await this.dashboardService.handleGoalCompleted(payload);
    }
    async onDocumentUploaded(payload) {
        this.logger.debug(`Received document.uploaded for user ${payload.user_id}`);
        await this.dashboardService.handleDocumentUploaded(payload);
    }
    async onQuizCompleted(payload) {
        this.logger.debug(`Received quiz.completed for user ${payload.user_id}`);
        await this.dashboardService.handleQuizCompleted(payload);
    }
    async onRoadmapStepCompleted(payload) {
        this.logger.debug(`Received roadmap.step_completed for user ${payload.user_id}`);
        await this.dashboardService.handleRoadmapStepCompleted(payload);
    }
    async onSummaryCreated(payload) {
        this.logger.debug(`Received summary.created for user ${payload.user_id}`);
        await this.dashboardService.handleSummaryCreated(payload);
    }
};
exports.DashboardEventsController = DashboardEventsController;
__decorate([
    (0, microservices_1.EventPattern)('user.created'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_created_event_dto_1.UserCreatedEventDto]),
    __metadata("design:returntype", Promise)
], DashboardEventsController.prototype, "onUserCreated", null);
__decorate([
    (0, microservices_1.EventPattern)('goal.created'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [goal_created_event_dto_1.GoalCreatedEventDto]),
    __metadata("design:returntype", Promise)
], DashboardEventsController.prototype, "onGoalCreated", null);
__decorate([
    (0, microservices_1.EventPattern)('goal.completed'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [goal_completed_event_dto_1.GoalCompletedEventDto]),
    __metadata("design:returntype", Promise)
], DashboardEventsController.prototype, "onGoalCompleted", null);
__decorate([
    (0, microservices_1.EventPattern)('document.uploaded'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [document_uploaded_event_dto_1.DocumentUploadedEventDto]),
    __metadata("design:returntype", Promise)
], DashboardEventsController.prototype, "onDocumentUploaded", null);
__decorate([
    (0, microservices_1.EventPattern)('quiz.completed'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quiz_completed_event_dto_1.QuizCompletedEventDto]),
    __metadata("design:returntype", Promise)
], DashboardEventsController.prototype, "onQuizCompleted", null);
__decorate([
    (0, microservices_1.EventPattern)('roadmap.step_completed'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [roadmap_step_completed_event_dto_1.RoadmapStepCompletedEventDto]),
    __metadata("design:returntype", Promise)
], DashboardEventsController.prototype, "onRoadmapStepCompleted", null);
__decorate([
    (0, microservices_1.EventPattern)('summary.created'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [summary_created_event_dto_1.SummaryCreatedEventDto]),
    __metadata("design:returntype", Promise)
], DashboardEventsController.prototype, "onSummaryCreated", null);
exports.DashboardEventsController = DashboardEventsController = DashboardEventsController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardEventsController);
//# sourceMappingURL=dashboard.events.controller.js.map