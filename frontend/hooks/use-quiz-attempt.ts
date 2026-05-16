import { useState, useEffect, useCallback } from "react";
import { getQuizById, submitQuiz, parseQuizError } from "@/lib/api/quiz.api";
import { getUserIdFromToken } from "@/lib/auth.utils";
import { QuizItem } from "@/types/quiz";

export function useQuizAttempt(quizId: string) {
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getQuizById(quizId);
        setQuiz(data);
      } catch (err) {
        setError(parseQuizError(err));
      } finally {
        setLoading(false);
      }
    };

    if (quizId) loadQuiz();
  }, [quizId]);

  const handleSelectOption = useCallback(
    (questionId: string, option: string) => {
      if (!submitted) {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: option,
        }));
      }
    },
    [submitted]
  );

  const handleSubmit = async () => {
    if (!quiz) return;

    if (Object.keys(answers).length !== quiz.questions.length) {
      setError(`Hãy trả lời tất cả ${quiz.questions.length} câu hỏi trước khi nộp bài.`);
      return;
    }

    try {
      setError(null);
      const userId = getUserIdFromToken();
      if (!userId) {
        setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        return;
      }
      await submitQuiz({
        quizId: quiz.id,
        userId,
        answers,
      });
      setSubmitted(true);
    } catch (err) {
      setError(parseQuizError(err));
    }
  };

  return {
    quiz,
    loading,
    error,
    submitted,
    answers,
    handleSelectOption,
    handleSubmit,
  };
}
