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

export async function getTutorHistory() {
  // TODO: tutor-service currently has no GET /tutor/history endpoint.
  return [] as TutorChatResponse[];
}
