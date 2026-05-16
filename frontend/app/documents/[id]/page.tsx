"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDocumentDetail } from "@/hooks/use-document-detail";
import { DocumentItem, DocumentStatus } from "@/types/document";
import { AiMessageContent } from "@/components/ai-message-content";
import {
  getCategoryMeta,
  getDocumentCategory,
} from "@/lib/document-categories";
import {
  ArrowLeftIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  RectangleStackIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";



const STATUS_LABEL: Record<DocumentStatus, string> = {
  UPLOADING: "Đang tải lên",
  PROCESSING: "Đang xử lý",
  READY: "Sẵn sàng",
  FAILED: "Lỗi xử lý",
};

function DocumentDetailContent() {
  const { id } = useParams();
  const docId = id as string;

  const { document, loading, error } = useDocumentDetail(docId);

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

  const analysis = document.aiAnalysis;
  const isPdf = document.fileType === "pdf";
  const category = getCategoryMeta(getDocumentCategory(docId));
  const processing =
    document.status === "UPLOADING" || document.status === "PROCESSING";
  const ready = document.status === "READY";
  const failed = document.status === "FAILED";
  const localMode =
    document.aiSource === "local" || analysis?.source === "local";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      <Link
        href="/documents"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Thư viện tài liệu
      </Link>

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
              <StatusBadge status={document.status ?? "READY"} />
              {document.documentType && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                  {document.documentType}
                </span>
              )}
              {ready && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Đã xử lý
                </span>
              )}
            </div>
            <h1 className="mt-2 truncate text-2xl font-extrabold text-slate-900">
              {document.fileName}
            </h1>
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

        {processing && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Đang xử lý tự động sau upload (trích xuất, phân loại, phân tích AI một lần)...
          </div>
        )}

        {localMode && ready && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
            AI hiện đang bận hoặc hết quota. Hệ thống đang sử dụng chế độ xử lý cục bộ.
          </div>
        )}

        {failed && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {document.processingError ||
              "Xử lý thất bại. Bạn vẫn có thể xem nội dung và dùng chế độ cục bộ."}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <ContentTab document={document} analysis={analysis} />
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const colors: Record<DocumentStatus, string> = {
    UPLOADING: "bg-slate-100 text-slate-600",
    PROCESSING: "bg-blue-100 text-blue-700",
    READY: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${colors[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function ContentTab({
  document,
  analysis,
}: {
  document: DocumentItem;
  analysis: DocumentItem["aiAnalysis"];
}) {
  const preview = document.previewText;
  return (
    <div className="space-y-6">
      {preview && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-slate-700">Xem trước nội dung</h3>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-800">
            {preview}
          </pre>
        </div>
      )}
      {analysis?.summary && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-slate-700">Phân tích (cache)</h3>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <AiMessageContent content={analysis.summary} />
          </div>
        </div>
      )}
      {!preview && !analysis?.summary && (
        <p className="text-sm text-slate-500">Chưa có nội dung hiển thị.</p>
      )}
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
