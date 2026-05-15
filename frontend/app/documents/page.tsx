"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDocuments, uploadDocument } from "@/lib/api/document.api";
import { DocumentItem } from "@/types/document";
import {
  DOCUMENT_CATEGORIES,
  DocumentCategoryId,
  getCategoryMeta,
  getDocumentCategory,
  isDocumentAnalyzed,
  saveDocumentCategory,
} from "@/lib/document-categories";
import {
  PlusIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const WORKFLOW_STEPS = [
  { step: 1, title: "Tải tài liệu", desc: "PDF hoặc DOCX tiếng Anh" },
  { step: 2, title: "AI phân tích", desc: "Tóm tắt từ vựng & câu hỏi" },
  { step: 3, title: "Học & luyện", desc: "Gia sư, Quiz, Flashcard" },
];

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategoryId>("ielts_toeic");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<DocumentCategoryId | "all">("all");
  const [, tick] = useState(0);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getDocuments();
      setDocuments(items);
      tick((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thư viện");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.fileName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const cat = getDocumentCategory(doc.id);
      const matchesCategory = filterCategory === "all" || cat === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, filterCategory, tick]);

  const stats = useMemo(() => {
    const analyzed = documents.filter((d) => isDocumentAnalyzed(d.id)).length;
    return { total: documents.length, analyzed, pending: documents.length - analyzed };
  }, [documents, tick]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    try {
      const res = await uploadDocument({ file: selectedFile });
      const data = res.data;
      const docId = data && !Array.isArray(data) ? data.id : undefined;

      if (docId) {
        saveDocumentCategory(docId, uploadCategory);
        setShowUploadModal(false);
        setSelectedFile(null);
        router.push(`/documents/${docId}?analyze=1`);
        return;
      }

      setShowUploadModal(false);
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải lên thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
      {/* Hero + workflow */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 text-white shadow-lg md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
              Thư viện tiếng Anh
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
              Tài liệu học Tiếng Anh
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Upload đề IELTS/TOEIC, bài Reading, ghi chú ngữ pháp hoặc danh sách từ vựng — AI sẽ
              phân tích và giúp bạn học qua tóm tắt, gia sư, quiz & flashcard.
            </p>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
            >
              <PlusIcon className="h-5 w-5" />
              Tải tài liệu mới
            </button>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            {WORKFLOW_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold">
                  {item.step}
                </span>
                <p className="mt-3 font-bold">{item.title}</p>
                <p className="mt-1 text-xs text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng tài liệu" value={stats.total} />
        <StatCard label="Đã phân tích AI" value={stats.analyzed} accent="text-emerald-600" />
        <StatCard label="Chờ phân tích" value={stats.pending} accent="text-amber-600" />
        <StatCard label="Định dạng" value="PDF · DOCX" small />
      </div>

      {/* Toolbar */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Tìm theo tên file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={filterCategory === "all"} onClick={() => setFilterCategory("all")}>
            Tất cả
          </FilterChip>
          {DOCUMENT_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat.id}
              active={filterCategory === cat.id}
              onClick={() => setFilterCategory(cat.id)}
            >
              {cat.label}
            </FilterChip>
          ))}
        </div>
      </section>

      {/* Grid */}
      {loading && !documents.length ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDocuments} />
      ) : filteredDocs.length === 0 ? (
        <EmptyState onUpload={() => setShowUploadModal(true)} hasDocs={documents.length > 0} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {showUploadModal && (
        <UploadModal
          selectedFile={selectedFile}
          uploadCategory={uploadCategory}
          isUploading={isUploading}
          error={error}
          onClose={() => setShowUploadModal(false)}
          onFileChange={handleFileChange}
          onCategoryChange={setUploadCategory}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
}

function DocumentCard({ doc }: { doc: DocumentItem }) {
  const category = getCategoryMeta(getDocumentCategory(doc.id));
  const analyzed = isDocumentAnalyzed(doc.id);
  const isPdf = doc.fileType === "pdf";

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <Link href={`/documents/${doc.id}`} className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isPdf ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            }`}
          >
            {isPdf ? (
              <DocumentIcon className="h-6 w-6" />
            ) : (
              <DocumentTextIcon className="h-6 w-6" />
            )}
          </div>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${category.color}`}
          >
            {category.label}
          </span>
        </div>

        <h3 className="mt-4 line-clamp-2 font-bold text-slate-900 group-hover:text-blue-600">
          {doc.fileName}
        </h3>

        <p className="mt-2 text-xs text-slate-500">
          {doc.fileType?.toUpperCase()} · {doc.fileSizeFormatted}
          {doc.uploadedAt && ` · ${new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}`}
        </p>

        <div className="mt-4 flex items-center gap-2">
          {analyzed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Đã phân tích
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
              <ClockIcon className="h-3.5 w-3.5" />
              Chờ phân tích
            </span>
          )}
        </div>
      </Link>

      <div className="grid grid-cols-3 gap-1 border-t border-slate-100 p-2">
        <QuickLink
          href={`/documents/${doc.id}`}
          icon={SparklesIcon}
          label="Phân tích"
          className="text-blue-600 hover:bg-blue-50"
        />
        <QuickLink
          href={`/tutor?documentId=${doc.id}`}
          icon={ChatBubbleLeftRightIcon}
          label="Gia sư"
          className="text-violet-600 hover:bg-violet-50"
        />
        <QuickLink
          href={`/practice?documentId=${doc.id}&tab=quiz`}
          icon={PuzzlePieceIcon}
          label="Quiz"
          className="text-orange-600 hover:bg-orange-50"
        />
      </div>
    </article>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  className,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-bold transition ${className}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function StatCard({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string | number;
  accent?: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 font-extrabold text-slate-900 ${small ? "text-lg" : "text-2xl"} ${accent ?? ""}`}>
        {value}
      </p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      <p className="mt-4 text-sm text-slate-500">Đang tải thư viện...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
      <InformationCircleIcon className="mx-auto h-10 w-10 text-red-500" />
      <p className="mt-3 text-sm font-medium text-red-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 text-sm font-bold text-red-600 hover:underline"
      >
        Thử lại
      </button>
    </div>
  );
}

function EmptyState({
  onUpload,
  hasDocs,
}: {
  onUpload: () => void;
  hasDocs: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
      <DocumentIcon className="h-14 w-14 text-slate-300" />
      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {hasDocs ? "Không có tài liệu phù hợp bộ lọc" : "Chưa có tài liệu nào"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {hasDocs
          ? "Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
          : "Bắt đầu với đề IELTS, bài Reading hoặc list từ vựng — AI sẽ hỗ trợ bạn học ngay."}
      </p>
      {!hasDocs && (
        <button
          type="button"
          onClick={onUpload}
          className="mt-6 font-bold text-blue-600 hover:text-blue-700"
        >
          Tải tài liệu đầu tiên →
        </button>
      )}
    </div>
  );
}

function UploadModal({
  selectedFile,
  uploadCategory,
  isUploading,
  error,
  onClose,
  onFileChange,
  onCategoryChange,
  onUpload,
}: {
  selectedFile: File | null;
  uploadCategory: DocumentCategoryId;
  isUploading: boolean;
  error: string | null;
  onClose: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (id: DocumentCategoryId) => void;
  onUpload: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Tải tài liệu tiếng Anh</h3>
            <p className="mt-1 text-xs text-slate-500">Bước 1 trong quy trình học</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <p className="mb-2 text-sm font-medium text-slate-700">Loại tài liệu</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {DOCUMENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                uploadCategory === cat.id
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition ${
            selectedFile ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50"
          }`}
        >
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={onFileChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <ArrowUpTrayIcon className="h-8 w-8 text-slate-400" />
          {selectedFile ? (
            <p className="mt-3 text-center text-sm font-bold text-slate-900">{selectedFile.name}</p>
          ) : (
            <p className="mt-3 text-center text-sm text-slate-600">
              Kéo thả hoặc chọn file PDF / DOCX (tối đa 10MB)
            </p>
          )}
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onUpload}
            disabled={!selectedFile || isUploading}
            className="flex-[2] rounded-xl bg-blue-600 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {isUploading ? "Đang tải lên..." : "Tải lên & phân tích AI"}
          </button>
        </div>
      </div>
    </div>
  );
}


