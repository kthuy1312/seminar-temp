"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getDocumentById } from "@/lib/api/document.api";
import { listQuiz, generateQuiz, parseQuizError } from "@/lib/api/quiz.api";
import { DocumentItem } from "@/types/document";
import { QuizItem } from "@/types/quiz";
import {
  PuzzlePieceIcon,
  SparklesIcon,
  PlayIcon,
  RectangleStackIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

type TabId = "quiz" | "flashcard";

function PracticeContent() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");
  const initialTab = searchParams.get("tab") === "flashcard" ? "flashcard" : "quiz";

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  useEffect(() => {
    setActiveTab(searchParams.get("tab") === "flashcard" ? "flashcard" : "quiz");
  }, [searchParams]);
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [quizList, doc] = await Promise.all([
        listQuiz(),
        documentId ? getDocumentById(documentId).catch(() => null) : Promise.resolve(null),
      ]);
      setQuizzes(quizList);
      setDocument(doc);
    } catch (err) {
      setError(parseQuizError(err));
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredQuizzes = useMemo(() => {
    if (!documentId) return quizzes;
    return quizzes.filter((q) => q.documentId === documentId);
  }, [quizzes, documentId]);

  const handleGenerateQuiz = async () => {
    if (!documentId) {
      setError("Hãy chọn tài liệu từ Thư viện trước khi tạo Quiz.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const newQuiz = await generateQuiz(documentId);
      setQuizzes((prev) => [newQuiz, ...prev.filter((q) => q.id !== newQuiz.id)]);
    } catch (err) {
      setError(parseQuizError(err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
      {/* Back + context */}
      {documentId && (
        <Link
          href={`/documents/${documentId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Về tài liệu
        </Link>
      )}

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-white shadow-lg md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-100">Luyện tiếng Anh</p>
        <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">Quiz & Flashcard</h1>
        <p className="mt-2 max-w-xl text-sm text-orange-50">
          Trắc nghiệm IELTS/TOEIC và thẻ từ vựng — tạo từ tài liệu đã phân tích AI.
        </p>

        {document && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm backdrop-blur-sm">
            <DocumentTextIcon className="h-4 w-4 shrink-0" />
            <span className="truncate font-medium">{document.fileName}</span>
          </div>
        )}

        {!documentId && (
          <Link
            href="/documents"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-50"
          >
            Chọn tài liệu để bắt đầu
          </Link>
        )}
      </section>

      {/* Tabs */}
      <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
        <TabButton active={activeTab === "quiz"} onClick={() => setActiveTab("quiz")} icon={PuzzlePieceIcon}>
          Quiz ({filteredQuizzes.length})
        </TabButton>
        <TabButton
          active={activeTab === "flashcard"}
          onClick={() => setActiveTab("flashcard")}
          icon={RectangleStackIcon}
        >
          Flashcard
        </TabButton>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-600" />
          <p className="mt-4 text-sm text-slate-500">Đang tải...</p>
        </div>
      ) : activeTab === "quiz" ? (
        <QuizPanel
          documentId={documentId}
          quizzes={filteredQuizzes}
          isGenerating={isGenerating}
          onGenerate={handleGenerateQuiz}
        />
      ) : (
        <FlashcardPanel documentId={documentId} />
      )}

      {/* Tip */}
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <div className="flex gap-3">
          <AcademicCapIcon className="h-5 w-5 shrink-0 text-violet-600" />
          <p>
            <strong className="text-slate-800">Mẹo:</strong> Phân tích tài liệu trước (Tài liệu → AI phân tích),
            sau đó tạo Quiz. Làm sai? Hỏi{" "}
            <Link href={documentId ? `/tutor?documentId=${documentId}` : "/tutor"} className="font-bold text-violet-600">
              Gia sư Tiếng Anh
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function QuizPanel({
  documentId,
  quizzes,
  isGenerating,
  onGenerate,
}: {
  documentId: string | null;
  quizzes: QuizItem[];
  isGenerating: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Create quiz CTA */}
      <section className="rounded-2xl border border-orange-200 bg-orange-50/50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Tạo Quiz từ tài liệu</h2>
            <p className="mt-1 text-sm text-slate-600">
              AI tạo 5 câu trắc nghiệm (từ vựng, ngữ pháp, đọc hiểu) — cần đã phân tích tài liệu.
            </p>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={!documentId || isGenerating}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang tạo (~15–30s)...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                Tạo Quiz mới
              </>
            )}
          </button>
        </div>
      </section>

      {/* Quiz list */}
      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <PuzzlePieceIcon className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 font-semibold text-slate-700">Chưa có Quiz</p>
          <p className="mt-1 text-sm text-slate-500">
            {documentId ? "Nhấn \"Tạo Quiz mới\" ở trên." : "Chọn tài liệu từ Thư viện."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {quizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-200"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <PuzzlePieceIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900">{quiz.title || "Quiz tiếng Anh"}</p>
                <p className="text-xs text-slate-500">
                  {quiz.questions?.length ?? 0} câu
                  {quiz.createdAt &&
                    ` · ${new Date(quiz.createdAt).toLocaleDateString("vi-VN")}`}
                </p>
              </div>
              <Link
                href={`/practice/${quiz.id}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                <PlayIcon className="h-3.5 w-3.5" />
                Làm bài
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FlashcardPanel({ documentId }: { documentId: string | null }) {
  const flashcardHref = documentId
    ? `/practice/flashcards?documentId=${documentId}`
    : "/practice/flashcards";

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-8 text-center">
      <RectangleStackIcon className="mx-auto h-14 w-14 text-emerald-600" />
      <h2 className="mt-4 text-xl font-bold text-slate-900">Flashcard từ vựng</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        Từ/cụm tiếng Anh — nghĩa tiếng Việt — ví dụ câu. Tạo từ tài liệu đã phân tích.
      </p>
      {!documentId ? (
        <Link
          href="/documents"
          className="mt-6 inline-block font-bold text-emerald-700 hover:underline"
        >
          Chọn tài liệu trước →
        </Link>
      ) : (
        <Link
          href={flashcardHref}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          <SparklesIcon className="h-5 w-5" />
          Mở Flashcard
        </Link>
      )}
    </section>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Đang tải...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
