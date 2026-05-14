export interface ExtractResult {
    text: string;
    charCount: number;
    lineCount: number;
    sourceType: 'pdf' | 'docx';
}
export declare class TextExtractionError extends Error {
    readonly cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
export declare class TextExtractorService {
    private readonly logger;
    extract(filePath: string, originalName: string): Promise<ExtractResult>;
    private extractFromPdf;
    private extractFromDocx;
    private cleanText;
}
