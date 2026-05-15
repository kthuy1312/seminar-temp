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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
const get_activity_query_dto_1 = require("./dto/get-activity-query.dto");
const get_progress_query_dto_1 = require("./dto/get-progress-query.dto");
const get_stats_query_dto_1 = require("./dto/get-stats-query.dto");
const goal_created_event_dto_1 = require("./dto/events/goal-created-event.dto");
const goal_completed_event_dto_1 = require("./dto/events/goal-completed-event.dto");
const document_uploaded_event_dto_1 = require("./dto/events/document-uploaded-event.dto");
const quiz_completed_event_dto_1 = require("./dto/events/quiz-completed-event.dto");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getStats(query, headerUserId) {
        return this.dashboardService.getStats(query.userId || headerUserId);
    }
    getActivity(query, headerUserId) {
        return this.dashboardService.getActivity({
            ...query,
            userId: query.userId || headerUserId,
        });
    }
    getProgress(query, headerUserId) {
        return this.dashboardService.getProgress({
            ...query,
            userId: query.userId || headerUserId,
        });
    }
    handleGoalCreated(payload) {
        return this.dashboardService.handleGoalCreated(payload);
    }
    handleGoalCompleted(payload) {
        return this.dashboardService.handleGoalCompleted(payload);
    }
    handleDocumentUploaded(payload) {
        return this.dashboardService.handleDocumentUploaded(payload);
    }
    handleQuizCompleted(payload) {
        return this.dashboardService.handleQuizCompleted(payload);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get aggregated dashboard stats' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_stats_query_dto_1.GetStatsQueryDto, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user activity logs' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_activity_query_dto_1.GetActivityQueryDto, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getActivity", null);
__decorate([
    (0, common_1.Get)('progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Get progress timeline by period' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_progress_query_dto_1.GetProgressQueryDto, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Post)('events/goal-created'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [goal_created_event_dto_1.GoalCreatedEventDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "handleGoalCreated", null);
__decorate([
    (0, common_1.Post)('events/goal-completed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [goal_completed_event_dto_1.GoalCompletedEventDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "handleGoalCompleted", null);
__decorate([
    (0, common_1.Post)('events/document-uploaded'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [document_uploaded_event_dto_1.DocumentUploadedEventDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "handleDocumentUploaded", null);
__decorate([
    (0, common_1.Post)('events/quiz-completed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quiz_completed_event_dto_1.QuizCompletedEventDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "handleQuizCompleted", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map