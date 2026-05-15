import { apiRequest } from "@/lib/api/client";
import { DocumentItem } from "@/types/document";

type DocumentEnvelope = {
  success?: boolean;
  data?: DocumentItem | DocumentItem[];
};

export async function uploadDocument(payload: { file: File; userId?: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const form = new FormData();
  form.append("file", payload.file);
  if (payload.userId) {
    form.append("userId", payload.userId);
  }

  const response = await fetch(`${baseUrl}/api/documents/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  const json = (await response.json()) as DocumentEnvelope;
  return json;
}

export type UploadDocumentResult = DocumentEnvelope;

export async function getDocuments() {
  const data = await apiRequest<DocumentItem[]>("/api/documents");
  return Array.isArray(data) ? data : [];
}

export async function getDocumentById(id: string) {
  const data = await apiRequest<DocumentItem>(`/api/documents/${id}`);
  return data || null;
}

export async function deleteDocument(id: string) {
  // TODO: document-service does not expose DELETE /api/documents/:id yet.
  // Keep adapter so UI can call this function safely.
  void id;
  return { success: false, message: "DELETE document endpoint is not available yet." };
}
