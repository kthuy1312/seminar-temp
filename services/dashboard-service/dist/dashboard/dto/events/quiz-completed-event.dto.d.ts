import { BaseEventDto } from './base-event.dto';
export declare class QuizCompletedEventDto extends BaseEventDto {
    quiz_id: string;
    score: number;
    metadata?: Record<string, unknown>;
}
