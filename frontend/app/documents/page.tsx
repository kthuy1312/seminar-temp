"use client";

import { useEffect, useState } from "react";

import { getDocuments } from "@/lib/api/document.api";
import { DocumentItem } from "@/types/document";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDocuments()
      .then((items) => setDocuments(items))
      .catch((err) => setError(err instanceof Error ? err.message : "Cannot load documents"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
      <p className="mt-2 text-sm text-slate-600">
        Upload and organize study materials for AI-powered analysis.
      </p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading documents...</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && documents.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">No document found yet.</p>
      )}

      {!loading && !error && documents.length > 0 && (
        <ul className="mt-4 space-y-2">
          {documents.map((document) => (
            <li key={document.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              {document.fileName}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
