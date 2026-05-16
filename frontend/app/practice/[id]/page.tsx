"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuizAttempt } from "@/hooks/use-quiz-attempt";
import { QuizQuestion } from "@/types/quiz";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const {
    quiz,
    loading,
    error,
    submitted,
    answers,
    handleSelectOption,
    handleSubmit,
  } = useQuizAttempt(quizId);

  if (loading) {
    return (
      <div className="mx-auto flex h-96 w-full max-w-5xl items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-600" />
          <p className="mt-4 text-sm text-slate-500">Đang tải bài quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại luyện tập
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-sm text-red-700">{error || "Không tìm thấy bài quiz"}</p>
          <Link
            href="/practice"
            className="mt-4 inline-block font-semibold text-red-600 hover:underline"
          >
            ← Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-12">
      {/* Header */}
      <Link
        href="/practice"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Quay lại luyện tập
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-white shadow-lg md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-100">Quiz tiếng Anh</p>
        <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">
          {quiz.title || "Quiz tiếng Anh"}
        </h1>
        <p className="mt-2 text-sm text-orange-50">
          {quiz.questions.length} câu trắc nghiệm{" "}
          {submitted && "· Bạn đã hoàn thành"}
        </p>
        {quiz.documentId && (
          <p className="mt-3 text-xs text-orange-100">
            📄 Từ tài liệu: <span className="font-mono">{quiz.documentId}</span>
          </p>
        )}
      </section>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Questions */}
      {!submitted ? (
        <div className="space-y-6">
          {quiz.questions.map((question: QuizQuestion, idx: number) => (
            <div key={question.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Câu {idx + 1}/{quiz.questions.length}
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {question.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {question.options.map((option: string, optIdx: number) => {
                  const isSelected = answers[question.id] === option;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(question.id, option)}
                      className={`block w-full rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition ${
                        isSelected
                          ? "border-orange-600 bg-orange-50 text-orange-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50"
                      }`}
                    >
                      <span className="font-semibold">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>{" "}
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Submit button */}
          <div className="sticky bottom-6 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== quiz.questions.length}
              className="flex-1 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Nộp bài ({Object.keys(answers).length}/{quiz.questions.length})
            </button>
          </div>
        </div>
      ) : (
        /* Results screen */
        <div className="space-y-6">
          {/* Score summary */}
          {(() => {
            const correct = quiz.questions.filter(
              (q: QuizQuestion) => answers[q.id] === q.correctAnswer
            ).length;
            const total = quiz.questions.length;
            const percentage = Math.round((correct / total) * 100);
            return (
              <div className={`rounded-2xl border-2 p-8 text-center ${
                percentage >= 70
                  ? "border-emerald-200 bg-emerald-50"
                  : percentage >= 50
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-red-200 bg-red-50"
              }`}>
                <CheckCircleIcon className={`mx-auto h-16 w-16 ${
                  percentage >= 70
                    ? "text-emerald-600"
                    : percentage >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                }`} />
                <h2 className={`mt-4 text-3xl font-bold ${
                  percentage >= 70
                    ? "text-emerald-900"
                    : percentage >= 50
                      ? "text-yellow-900"
                      : "text-red-900"
                }`}>
                  {correct}/{total} câu đúng
                </h2>
                <p className={`mt-2 text-lg font-semibold ${
                  percentage >= 70
                    ? "text-emerald-700"
                    : percentage >= 50
                      ? "text-yellow-700"
                      : "text-red-700"
                }`}>
                  {percentage}%
                </p>
                <p className={`mt-2 text-sm ${
                  percentage >= 70
                    ? "text-emerald-600"
                    : percentage >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}>
                  {percentage >= 70
                    ? "Tuyệt vời! Tiếp tục cố gắng!"
                    : percentage >= 50
                      ? "Khá tốt! Còn cần ôn luyện thêm."
                      : "Cần luyện tập thêm nhiều."}
                </p>
              </div>
            );
          })()}

          {/* Review answers */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Chi tiết câu trả lời:</h3>
            {quiz.questions.map((question: QuizQuestion, idx: number) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              return (
                <div key={question.id} className={`rounded-xl border-2 p-5 ${
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                      {isCorrect ? (
                        <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">
                        Câu {idx + 1}: {question.questionText}
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className={`rounded-lg px-3 py-2 text-sm ${
                          isCorrect
                            ? "border border-emerald-300 bg-white text-emerald-900"
                            : "border border-red-300 bg-white text-red-900"
                        }`}>
                          <strong>Bạn chọn:</strong> {userAnswer}
                        </div>
                        {!isCorrect && (
                          <div className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm text-emerald-900">
                            <strong>Đáp án đúng:</strong> {question.correctAnswer}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/practice"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              ← Quay lại luyện tập
            </Link>
            <Link
              href="/tutor"
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700"
            >
              <SparklesIcon className="h-4 w-4" />
              Hỏi Gia sư Tiếng Anh
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
