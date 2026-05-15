"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getDocumentById } from "@/lib/api/document.api";
import { getSummaryByDocumentId, generateSummary } from "@/lib/api/summary.api";
import { ApiError } from "@/lib/api/client";
import { DocumentItem } from "@/types/document";
import { SummaryItem } from "@/types/summary";
import { AiMessageContent } from "@/components/ai-message-content";
import {
  getCategoryMeta,
  getDocumentCategory,
  markDocumentAnalyzed,
  isDocumentAnalyzed,
} from "@/lib/document-categories";
import {
  ArrowLeftIcon,
  DocumentIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  RectangleStackIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const LEARNING_ACTIONS = [
  {
    href: (id: string) => `/tutor?documentId=${id}`,
    icon: ChatBubbleLeftRightIcon,
    title: "Gia sư Tiếng Anh",
    desc: "Hỏi đáp, sửa câu, giải thích ngữ pháp",
    color: "border-violet-200 bg-violet-50 hover:bg-violet-100",
    iconColor: "text-violet-600",
    requiresAnalysis: false,
  },
  {
    href: (id: string) => `/practice?documentId=${id}&tab=quiz`,
    icon: PuzzlePieceIcon,
    title: "Quiz tiếng Anh",
    desc: "Trắc nghiệm IELTS/TOEIC từ tài liệu",
    color: "border-orange-200 bg-orange-50 hover:bg-orange-100",
    iconColor: "text-orange-600",
    requiresAnalysis: true,
  },
  {
    href: (id: string) => `/practice?documentId=${id}&tab=flashcard`,
    icon: RectangleStackIcon,
    title: "Flashcard",
    desc: "Từ vựng + nghĩa tiếng Việt",
    color: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100",
    iconColor: "text-emerald-600",
    requiresAnalysis: true,
  },
];

function DocumentDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldAutoAnalyze = searchParams.get("analyze") === "1";

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [summary, setSummary] = useState<SummaryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const docId = id as string;
  const category = document ? getCategoryMeta(getDocumentCategory(docId)) : null;
  const analyzed = summary !== null || isDocumentAnalyzed(docId);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const doc = await getDocumentById(docId);
      setDocument(doc);

      try {
        const existing = await getSummaryByDocumentId(docId);
        if (existing?.content) {
          setSummary(existing);
          markDocumentAnalyzed(docId);
          setActiveStep(3);
        } else {
          setActiveStep(1);
        }
      } catch {
        setActiveStep(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải tài liệu");
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateSummary = useCallback(
    async (force = false) => {
      setIsGenerating(true);
      setActiveStep(2);
      setAnalyzeError(null);
      try {
        const result = await generateSummary(docId, force);
        if (result?.content) {
          setSummary(result);
          markDocumentAnalyzed(docId);
          setActiveStep(3);
          router.replace(`/documents/${docId}`, { scroll: false });
        }
      } catch (err) {
        let message = "Phân tích thất bại. Vui lòng thử lại.";
        if (err instanceof ApiError) {
          try {
            const parsed = JSON.parse(err.message) as { message?: string };
            message = parsed.message || err.message;
          } catch {
            message = err.message || message;
          }
        } else if (err instanceof Error) {
          message = err.message;
        }
        setAnalyzeError(message);
        setActiveStep(1);
      } finally {
        setIsGenerating(false);
      }
    },
    [docId, router]
  );

  useEffect(() => {
    if (shouldAutoAnalyze && !loading && document && !summary && !isGenerating) {
      handleGenerateSummary();
    }
  }, [shouldAutoAnalyze, loading, document, summary, isGenerating, handleGenerateSummary]);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <p className="text-sm text-slate-500">Đang tải tài liệu...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Không tìm thấy tài liệu</h2>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Link href="/documents" className="mt-6 inline-block font-bold text-blue-600">
          ← Về thư viện
        </Link>
      </div>
    );
  }

  const isPdf = document.fileType === "pdf";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      <Link
        href="/documents"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Thư viện tài liệu
      </Link>

      {/* File header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
              isPdf ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            }`}
          >
            {isPdf ? <DocumentIcon className="h-8 w-8" /> : <DocumentTextIcon className="h-8 w-8" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${category.color}`}
                >
                  {category.label}
                </span>
              )}
              {analyzed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Đã phân tích AI
                </span>
              )}
            </div>
            <h1 className="mt-2 truncate text-2xl font-extrabold text-slate-900">{document.fileName}</h1>
            <p className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="uppercase font-bold">{document.fileType}</span>
              <span>{document.fileSizeFormatted}</span>
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                {document.uploadedAt
                  ? new Date(document.uploadedAt).toLocaleDateString("vi-VN")
                  : "—"}
              </span>
            </p>
          </div>
          {document.url && (
            <a
              href={document.url}
              download
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Tải về
            </a>
          )}
        </div>
      </section>

      {/* Workflow stepper */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Quy trình học từ tài liệu
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <WorkflowStep
            n={1}
            title="Tải lên"
            done
            active={activeStep === 1}
            desc="File đã lưu"
          />
          <WorkflowStep
            n={2}
            title="AI phân tích"
            done={analyzed}
            active={activeStep === 2 || (activeStep === 1 && !analyzed)}
            desc={isGenerating ? "Đang đọc file..." : analyzed ? "Đã tóm tắt" : "Chưa phân tích"}
          />
          <WorkflowStep
            n={3}
            title="Học & luyện"
            done={false}
            active={activeStep === 3}
            desc="Gia sư · Quiz · Flashcard"
          />
        </div>
      </section>

      {/* Step 2: Analyze */}
      {!analyzed && (
        <section className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center">
          <SparklesIcon className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Bước 2: Phân tích tài liệu bằng AI</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            AI sẽ đọc toàn bộ file, trích xuất câu hỏi bài tập, từ vựng và ngữ pháp — làm cơ sở cho
            gia sư, quiz và flashcard.
          </p>
          {analyzeError && (
            <p className="mx-auto mt-4 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {analyzeError}
            </p>
          )}
          <button
            type="button"
            onClick={() => handleGenerateSummary(false)}
            disabled={isGenerating}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang phân tích (10–30 giây)...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                Bắt đầu phân tích AI
              </>
            )}
          </button>
          <p className="mt-4 text-xs text-slate-500">
            Hoặc{" "}
            <Link href={`/tutor?documentId=${docId}`} className="font-bold text-violet-600 hover:underline">
              hỏi gia sư ngay
            </Link>{" "}
            (đọc trực tiếp nội dung file)
          </p>
        </section>
      )}

      {/* Step 3: Learning hub */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">Học từ tài liệu này</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LEARNING_ACTIONS.map((action) => {
            const Icon = action.icon;
            const disabled = action.requiresAnalysis && !analyzed;
            const href = action.href(docId);

            if (disabled) {
              return (
                <div
                  key={action.title}
                  className="cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 p-5 opacity-60"
                >
                  <Icon className={`h-8 w-8 ${action.iconColor}`} />
                  <h3 className="mt-3 font-bold text-slate-700">{action.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{action.desc}</p>
                  <p className="mt-2 text-[10px] font-bold text-amber-600">Cần phân tích AI trước</p>
                </div>
              );
            }

            return (
              <Link
                key={action.title}
                href={href}
                className={`rounded-2xl border p-5 transition ${action.color}`}
              >
                <Icon className={`h-8 w-8 ${action.iconColor}`} />
                <h3 className="mt-3 font-bold text-slate-900">{action.title}</h3>
                <p className="mt-1 text-xs text-slate-600">{action.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Summary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Kết quả phân tích AI</h2>
              <p className="text-xs text-slate-500">Từ vựng · Ngữ pháp · Câu hỏi trong tài liệu</p>
            </div>
          </div>
          {summary && (
            <button
              type="button"
              onClick={() => handleGenerateSummary(true)}
              disabled={isGenerating}
              className="text-xs font-bold text-blue-600 hover:underline disabled:opacity-50"
            >
              Phân tích lại
            </button>
          )}
        </div>

        {isGenerating && !summary ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-4 font-semibold text-slate-900">AI đang đọc {document.fileName}...</p>
            <p className="mt-1 text-xs text-slate-500">Trích xuất câu hỏi, từ vựng và gợi ý học</p>
          </div>
        ) : summary ? (
          <div className="max-h-[32rem] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-6">
            <AiMessageContent content={summary.content} />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
            Chưa có kết quả phân tích. Nhấn &quot;Bắt đầu phân tích AI&quot; ở trên.
          </div>
        )}
      </section>
    </div>
  );
}

function WorkflowStep({
  n,
  title,
  done,
  active,
  desc,
}: {
  n: number;
  title: string;
  done: boolean;
  active: boolean;
  desc: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 transition ${
        active ? "border-blue-300 bg-blue-50" : done ? "border-emerald-200 bg-emerald-50/50" : "border-slate-100 bg-slate-50"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          done ? "bg-emerald-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
        }`}
      >
        {done ? <CheckCircleIcon className="h-5 w-5" /> : n}
      </span>
      <div>
        <p className="font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

export default function DocumentDetailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Đang tải...</div>}>
      <DocumentDetailContent />
    </Suspense>
  );
}
