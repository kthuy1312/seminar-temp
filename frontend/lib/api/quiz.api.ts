import { apiRequest } from "@/lib/api/client";
import { QuizItem } from "@/types/quiz";

export async function generateQuiz(documentId: string) {
  return apiRequest<QuizItem>("/api/quiz/generate", {
    method: "POST",
    body: { documentId },
  });
}

export async function getQuizById(id: string) {
  return apiRequest<QuizItem>(`/api/quiz/${id}`);
}

export async function listQuiz() {
  return apiRequest<QuizItem[]>("/api/quiz");
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
