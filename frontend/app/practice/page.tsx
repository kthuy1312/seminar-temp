"use client";

import { useEffect, useState } from "react";

import { listQuiz } from "@/lib/api/quiz.api";
import { QuizItem } from "@/types/quiz";

export default function PracticePage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listQuiz()
      .then((items) => setQuizzes(items))
      .catch((err) => setError(err instanceof Error ? err.message : "Cannot load quizzes"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Practice</h1>
      <p className="mt-2 text-sm text-slate-600">
        Generate quizzes and flashcards to reinforce concepts.
      </p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading quizzes...</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && quizzes.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">No quiz available yet.</p>
      )}
    </section>
  );
}
