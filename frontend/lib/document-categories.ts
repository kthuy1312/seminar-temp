export type DocumentCategoryId =
  | "ielts_toeic"
  | "reading"
  | "grammar"
  | "vocabulary"
  | "other";

export const DOCUMENT_CATEGORIES: {
  id: DocumentCategoryId;
  label: string;
  hint: string;
  color: string;
}[] = [
  {
    id: "ielts_toeic",
    label: "Đề IELTS / TOEIC",
    hint: "Đề thi, practice test",
    color: "bg-violet-100 text-violet-700 border-violet-200",
  },
  {
    id: "reading",
    label: "Bài Reading",
    hint: "Đoạn đọc hiểu",
    color: "bg-sky-100 text-sky-700 border-sky-200",
  },
  {
    id: "grammar",
    label: "Ngữ pháp",
    hint: "Ghi chú grammar",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: "vocabulary",
    label: "Từ vựng",
    hint: "Word list, flashcard source",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    id: "other",
    label: "Khác",
    hint: "Tài liệu tổng hợp",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
];

const CATEGORY_KEY = "english_doc_category";
const ANALYZED_KEY = "english_doc_analyzed";

export function saveDocumentCategory(documentId: string, categoryId: DocumentCategoryId) {
  if (typeof window === "undefined") return;
  const map = getCategoryMap();
  map[documentId] = categoryId;
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(map));
}

export function getDocumentCategory(documentId: string): DocumentCategoryId {
  const map = getCategoryMap();
  return map[documentId] ?? "other";
}

export function markDocumentAnalyzed(documentId: string) {
  if (typeof window === "undefined") return;
  const set = getAnalyzedSet();
  set.add(documentId);
  localStorage.setItem(ANALYZED_KEY, JSON.stringify([...set]));
}

export function isDocumentAnalyzed(documentId: string): boolean {
  return getAnalyzedSet().has(documentId);
}

function getCategoryMap(): Record<string, DocumentCategoryId> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CATEGORY_KEY) || "{}");
  } catch {
    return {};
  }
}

function getAnalyzedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(ANALYZED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function getCategoryMeta(id: DocumentCategoryId) {
  return DOCUMENT_CATEGORIES.find((c) => c.id === id) ?? DOCUMENT_CATEGORIES[4];
}
