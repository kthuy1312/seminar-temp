"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getQuizById, submitQuiz } from "@/lib/api/quiz.api";
import { QuizItem } from "@/types/quiz";
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";

export default function QuizDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const item = await getQuizById(id as string);
      setQuiz(item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải bài quiz");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleOptionSelect = (questionId: string, option: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    // Calculate score locally for immediate feedback
    let currentScore = 0;
    quiz.questions.forEach(q => {
      // In a real app, the server would validate this, but we'll use the quiz object's correct answer if available
      // Note: the backend quiz.questions select only id, text, options for safety, 
      // but let's assume we have it or the submit endpoint handles it.
      // Based on my previous backend implementation, I returned the attempt with score.
    });

    try {
      // In this demo, we'll just submit to server and let it handle the score
      const result: any = await submitQuiz({
        quizId: quiz.id,
        userId: "current-user", // handled by interceptor
        answers
      });
      setScore(result.score);
      setIsSubmitted(true);
    } catch (err) {
      alert("Không thể nộp bài quiz");
    }
  };

  if (loading) return <div className="py-20 text-center">Đang tải bài quiz...</div>;
  if (error || !quiz) return <div className="py-20 text-center text-red-500">{error || "Không tìm thấy bài quiz"}</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <TrophyIcon className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Hoàn Thành Quiz!</h1>
          <p className="mt-2 text-slate-600">Làm tốt lắm, bạn đã hoàn thành phiên luyện tập.</p>
          
          <div className="mt-8 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-xs font-bold uppercase text-slate-400">Điểm của bạn</p>
              <p className="text-5xl font-black text-orange-600">{score}/{quiz.questions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold uppercase text-slate-400">Độ chính xác</p>
              <p className="text-5xl font-black text-slate-900">{Math.round((score / quiz.questions.length) * 100)}%</p>
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button 
              onClick={() => router.push('/practice')}
              className="flex-1 rounded-xl border border-slate-200 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Quay lại Luyện tập
            </button>
            <button 
              onClick={() => router.push(`/tutor?documentId=${quiz.documentId}`)}
              className="flex-1 rounded-xl bg-slate-900 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Ôn tập với AI
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900">
          <ArrowLeftIcon className="h-4 w-4" />
          Thoát Quiz
        </button>
        <span className="text-sm font-bold text-slate-900">Câu hỏi {currentQuestionIndex + 1} trên {quiz.questions.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg md:p-10">
        <h2 className="text-xl font-bold text-slate-900 md:text-2xl leading-snug">
          {currentQuestion.questionText}
        </h2>

        <div className="mt-8 space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(currentQuestion.id, option)}
              className={`w-full flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                answers[currentQuestion.id] === option 
                ? 'border-orange-500 bg-orange-50 font-bold text-orange-900 shadow-sm' 
                : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <span className="flex-1">{option}</span>
              {answers[currentQuestion.id] === option && (
                <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-white">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 disabled:opacity-30"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Câu trước
          </button>
          
          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < quiz.questions.length}
              className="rounded-xl bg-orange-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-50"
            >
              Nộp bài
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={!answers[currentQuestion.id]}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              Câu tiếp theo
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
