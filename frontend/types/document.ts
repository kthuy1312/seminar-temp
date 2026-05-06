export type DocumentItem = {
  id: string;
  userId?: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileSizeFormatted?: string;
  url?: string;
  uploadedAt?: string;
};
