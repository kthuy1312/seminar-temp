import { apiRequest } from "@/lib/api/client";
import { TutorChatResponse } from "@/types/tutor";

export async function sendTutorMessage(payload: {
  question: string;
  documentId: string;
  conversationId?: string;
}) {
  return apiRequest<TutorChatResponse>("/api/tutor/ask", {
    method: "POST",
    body: payload,
  });
}

export async function getTutorHistory(documentId?: string) {
  const params = documentId ? `?documentId=${documentId}` : "";
  const response = await apiRequest<{ data: TutorChatResponse[] }>(`/api/tutor/history${params}`);
  return response.data || [];
}
