import { apiRequest } from "@/lib/api/client";
import { SummaryItem } from "@/types/summary";

type SummaryEnvelope = {
  success: boolean;
  data: SummaryItem;
};

export async function getSummaryByDocumentId(documentId: string) {
  return apiRequest<SummaryItem>(`/api/summaries/document/${documentId}`);
}

export async function generateSummary(documentId: string, force = false) {
  return apiRequest<SummaryItem>("/api/summaries/generate", {
    method: "POST",
    body: { documentId, force },
  });
}
