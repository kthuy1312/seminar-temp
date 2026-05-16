export type DocumentStatus = "UPLOADING" | "PROCESSING" | "READY" | "FAILED";

export type DocumentTypeKind =
  | "vocabulary"
  | "reading"
  | "multiple_choice"
  | "mixed"
  | "other";

export type AiAnalysis = {
  vocabulary: { term: string; meaning: string }[];
  grammar: string[];
  summary: string;
  questions: {
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
  flashcards: { front: string; back: string }[];
  source?: "ai" | "local" | "hybrid";
  documentType?: DocumentTypeKind;
  generatedAt?: string;
};

export type DocumentItem = {
  id: string;
  userId?: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileSizeFormatted?: string;
  url?: string;
  uploadedAt?: string;
  status?: DocumentStatus;
  documentType?: DocumentTypeKind | null;
  aiSource?: string | null;
  processingError?: string | null;
  processedAt?: string | null;
  hasAiAnalysis?: boolean;
  previewText?: string | null;
  aiAnalysis?: AiAnalysis | null;
};

export type DocumentProcessingStatus = {
  status: DocumentStatus;
  documentType?: DocumentTypeKind | null;
  aiSource?: string | null;
  processingMs?: number | null;
  processingError?: string | null;
  processedAt?: string | null;
  hasAiAnalysis: boolean;
};
