export interface AIQuestion {
    id: number;
    question: string;
    options: Record<string, string>;
    answer: string;
}
export interface AIQuizResponse {
    quiz_title: string;
    questions: AIQuestion[];
}
export declare class AIResponseParser {
    private static readonly logger;
    static parseQuizResponse(aiRawText: string): AIQuizResponse;
    private static validateStructure;
}
