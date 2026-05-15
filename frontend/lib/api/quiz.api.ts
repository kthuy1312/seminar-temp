import { apiRequest, ApiError } from "@/lib/api/client";
import { QuizItem } from "@/types/quiz";

type QuizListPayload = {
  data?: QuizItem[];
  pagination?: { total?: number };
};

export async function generateQuiz(documentId: string) {
  return apiRequest<QuizItem>("/api/quiz/generate", {
    method: "POST",
    body: { documentId },
    timeoutMs: 120000,
  });
}

export function parseQuizError(err: unknown): string {
  if (err instanceof ApiError) {
    try {
      const parsed = JSON.parse(err.message) as { message?: string };
      return parsed.message || err.message;
    } catch {
      return err.message;
    }
  }
  return err instanceof Error ? err.message : "Có lỗi xảy ra";
}

export async function getQuizById(id: string) {
  return apiRequest<QuizItem>(`/api/quiz/${id}`);
}

export async function listQuiz() {
  const response = await apiRequest<QuizListPayload | QuizItem[]>("/api/quiz");
  if (Array.isArray(response)) return response;
  return response?.data ?? [];
}

export async function submitQuiz(payload: {
  quizId: string;
  userId: string;
  answers: Record<string, string>;
}) {
  return apiRequest("/api/quiz/submit", {
    method: "POST",
    body: payload,
  });
}

// --- Flashcards ---

export async function getFlashcards(documentId?: string) {
  const url = documentId ? `/api/quiz/flashcards/all?documentId=${documentId}` : "/api/quiz/flashcards/all";
  return apiRequest<any[]>(url);
}

export async function generateFlashcards(documentId: string) {
  return apiRequest<any[]>("/api/quiz/flashcards/generate", {
    method: "POST",
    body: { documentId },
    timeoutMs: 120000,
  });
}

export async function deleteFlashcard(id: string) {
  return apiRequest<any>(`/api/quiz/flashcards/${id}`, {
    method: "DELETE",
  });
}
