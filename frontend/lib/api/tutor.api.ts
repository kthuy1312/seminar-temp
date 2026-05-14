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
  // TODO: tutor-service needs GET /api/tutor/history endpoint
  // For now, call the endpoint when implemented
  try {
    return apiRequest<TutorChatResponse[]>("/api/tutor/history");
  } catch (error) {
    console.warn("Tutor history endpoint not yet implemented. Returning empty array.");
    return [];
  }
}
