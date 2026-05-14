export declare enum FileTypeEnum {
    PDF = "pdf",
    DOCX = "docx"
}
export declare const ALLOWED_MIME_TYPES: Record<FileTypeEnum, string>;
export declare const ALLOWED_EXTENSIONS: string[];
export declare const MAX_FILE_SIZE_BYTES: number;
export declare class UploadDocumentDto {
    userId?: string;
}
export declare class QueryDocumentsDto {
    userId?: string;
    fileType?: FileTypeEnum;
}
