export declare enum FileType {
    PDF = "pdf",
    DOCX = "docx",
    TXT = "txt",
    PPTX = "pptx",
    XLSX = "xlsx"
}
export interface Document {
    id: string;
    userId: string;
    fileName: string;
    fileType: FileType;
    filePath: string;
    fileSize: bigint;
    uploadedAt: Date;
}
