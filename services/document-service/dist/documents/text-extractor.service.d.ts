export interface ExtractResult {
    text: string;
    charCount: number;
    lineCount: number;
    sourceType: string;
}
export declare class TextExtractorService {
    private readonly logger;
    extract(filePath: string, fileName: string): Promise<ExtractResult>;
}
