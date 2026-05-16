import { useState, useCallback, useEffect } from "react";
import { getDocumentById, getDocumentProcessingStatus } from "@/lib/api/document.api";
import { DocumentItem } from "@/types/document";
import { markDocumentAnalyzed } from "@/lib/document-categories";

export function useDocumentDetail(docId: string) {
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const doc = await getDocumentById(docId);
      setDocument(doc);
      if (doc.status === "READY" && doc.hasAiAnalysis) {
        markDocumentAnalyzed(docId);
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

  useEffect(() => {
    if (!document) return;
    const status = document.status;
    if (status !== "UPLOADING" && status !== "PROCESSING") return;

    const timer = setInterval(async () => {
      try {
        const statusRes = await getDocumentProcessingStatus(docId);
        const doc = await getDocumentById(docId);
        setDocument(doc);
        if (statusRes.status === "READY" || statusRes.status === "FAILED") {
          clearInterval(timer);
          if (statusRes.status === "READY") markDocumentAnalyzed(docId);
        }
      } catch {
        /* ignore poll errors */
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [document?.status, docId, document]);

  return { document, loading, error };
}
