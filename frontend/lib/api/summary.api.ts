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
  // TODO: summary-service currently has no POST endpoint to trigger generation.
  // Generation currently depends on document.uploaded event flow.
  void documentId;
  return { success: false, message: "Summary generation endpoint is not available yet." };
}
