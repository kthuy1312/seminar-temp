import { useState, useCallback, useEffect, useMemo } from "react";
import { getDocumentById, getDocuments } from "@/lib/api/document.api";
import { listQuiz, generateQuiz, parseQuizError, deleteQuiz } from "@/lib/api/quiz.api";
import { DocumentItem } from "@/types/document";
import { QuizItem } from "@/types/quiz";

export function usePractice(documentId: string | null) {
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [quizList, doc, docsList] = await Promise.all([
        listQuiz(),
        documentId ? getDocumentById(documentId).catch(() => null) : Promise.resolve(null),
        getDocuments().catch(() => []),
      ]);
      setQuizzes(quizList);
      setDocument(doc);
      setDocuments(docsList);
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

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bộ Quiz này và mọi kết quả làm bài?")) return;
    try {
      await deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (err) {
      setError(parseQuizError(err));
    }
  };

  return {
    document,
    documents,
    quizzes: filteredQuizzes,
    loading,
    isGenerating,
    error,
    handleGenerateQuiz,
    handleDeleteQuiz,
  };
}
