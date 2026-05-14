import { DashboardService } from './dashboard.service';
import { DocumentUploadedEventDto } from './dto/events/document-uploaded-event.dto';
import { GoalCompletedEventDto } from './dto/events/goal-completed-event.dto';
import { GoalCreatedEventDto } from './dto/events/goal-created-event.dto';
import { QuizCompletedEventDto } from './dto/events/quiz-completed-event.dto';
import { RoadmapStepCompletedEventDto } from './dto/events/roadmap-step-completed-event.dto';
import { SummaryCreatedEventDto } from './dto/events/summary-created-event.dto';
import { UserCreatedEventDto } from './dto/events/user-created-event.dto';
export declare class DashboardEventsController {
    private readonly dashboardService;
    private readonly logger;
    constructor(dashboardService: DashboardService);
    onUserCreated(payload: UserCreatedEventDto): Promise<void>;
    onGoalCreated(payload: GoalCreatedEventDto): Promise<void>;
    onGoalCompleted(payload: GoalCompletedEventDto): Promise<void>;
    onDocumentUploaded(payload: DocumentUploadedEventDto): Promise<void>;
    onQuizCompleted(payload: QuizCompletedEventDto): Promise<void>;
    onRoadmapStepCompleted(payload: RoadmapStepCompletedEventDto): Promise<void>;
    onSummaryCreated(payload: SummaryCreatedEventDto): Promise<void>;
}
