import { apiRequest } from "@/lib/api/client";
import { SummaryItem } from "@/types/summary";

type SummaryEnvelope = {
  success: boolean;
  data: SummaryItem;
};

export async function getSummaryByDocumentId(documentId: string) {
  return apiRequest<SummaryEnvelope>(`/api/summaries/document/${documentId}`);
}

export async function generateSummary(documentId: string) {
  // TODO: summary-service needs POST /api/summaries/generate endpoint
  // Currently generation is event-driven (happens on document.uploaded)
  // For now, call the endpoint when implemented
  try {
    return apiRequest<SummaryEnvelope>("/api/summaries/generate", {
      method: "POST",
      body: { documentId },
    });
  } catch (error) {
    console.warn("Summary generation endpoint not yet implemented. Try uploading the document to trigger auto-generation.");
    throw error;
  }
}
