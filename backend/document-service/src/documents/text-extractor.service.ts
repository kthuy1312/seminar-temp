import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

// ─── Kết quả extract ──────────────────────────────────────────

export interface ExtractResult {
  /** Toàn bộ nội dung text thuần đã được chuẩn hóa */
  text: string;
  /** Số lượng ký tự (sau khi trim) */
  charCount: number;
  /** Số dòng */
  lineCount: number;
  /** Định dạng nguồn */
  sourceType: 'pdf' | 'docx';
}

// ─── Custom error ─────────────────────────────────────────────

export class TextExtractionError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'TextExtractionError';
  }
}

// ─── Service ──────────────────────────────────────────────────

@Injectable()
export class TextExtractorService {
  private readonly logger = new Logger(TextExtractorService.name);

  /**
   * Extract text từ file PDF hoặc DOCX.
   *
   * @param filePath  Đường dẫn tuyệt đối tới file trên disk
   * @param originalName  Tên gốc của file (để xác định extension)
   * @returns ExtractResult chứa text thuần + metadata
   * @throws UnprocessableEntityException nếu file bị hỏng / không đọc được
   */
  async extract(filePath: string, originalName: string): Promise<ExtractResult> {
    const ext = extname(originalName).toLowerCase();

    this.logger.debug(`Extracting text from: ${originalName} (${ext})`);

    switch (ext) {
      case '.pdf':
        return this.extractFromPdf(filePath);
      case '.docx':
        return this.extractFromDocx(filePath);
      default:
        throw new UnprocessableEntityException(
          `Không hỗ trợ extract text từ định dạng "${ext}". Chỉ hỗ trợ: .pdf, .docx`,
        );
    }
  }

  // ─── PDF ────────────────────────────────────────────────────

  /**
   * Dùng pdf-parse để đọc tất cả trang và ghép thành text thuần.
   * pdf-parse tự handle: multi-page, encoding, encrypted PDF (nếu không có password).
   */
  private async extractFromPdf(filePath: string): Promise<ExtractResult> {
    let buffer: Buffer;

    try {
      buffer = await readFile(filePath);
    } catch (err) {
      this.logger.error(`Cannot read PDF file at "${filePath}"`, err);
      throw new UnprocessableEntityException(
        'Không thể đọc file PDF. File có thể đã bị xóa hoặc bị hỏng.',
      );
    }

    try {
      const data = await pdfParse(buffer, {
        // Không render page content (chỉ lấy text, tối ưu performance)
        pagerender: undefined,
      });

      if (!data.text || data.text.trim().length === 0) {
        this.logger.warn(`PDF "${filePath}" extracted but text is empty (might be scanned/image-based)`);
        throw new UnprocessableEntityException(
          'File PDF không chứa text có thể đọc được. '
          + 'File có thể là ảnh scan — cần OCR để xử lý.',
        );
      }

      const cleaned = this.cleanText(data.text);
      this.logger.log(`PDF extracted: ${cleaned.charCount} chars, ${data.numpages} pages`);

      return { ...cleaned, sourceType: 'pdf' };
    } catch (err) {
      // Re-throw các lỗi đã được xử lý ở trên
      if (err instanceof UnprocessableEntityException) throw err;

      this.logger.error(`pdf-parse failed for "${filePath}"`, err);
      throw new UnprocessableEntityException(
        'Không thể parse nội dung PDF. File có thể bị mã hóa hoặc bị lỗi cấu trúc.',
      );
    }
  }

  // ─── DOCX ───────────────────────────────────────────────────

  /**
   * Dùng mammoth để chuyển DOCX → plain text.
   * mammoth bỏ qua toàn bộ formatting (bold, color…), chỉ giữ nội dung.
   */
  private async extractFromDocx(filePath: string): Promise<ExtractResult> {
    let buffer: Buffer;

    try {
      buffer = await readFile(filePath);
    } catch (err) {
      this.logger.error(`Cannot read DOCX file at "${filePath}"`, err);
      throw new UnprocessableEntityException(
        'Không thể đọc file DOCX. File có thể đã bị xóa hoặc bị hỏng.',
      );
    }

    try {
      // mammoth.extractRawText: chỉ lấy text, bỏ qua toàn bộ styling
      const result = await mammoth.extractRawText({ buffer });

      // mammoth.messages chứa warning (ví dụ: font không nhận dạng được)
      if (result.messages.length > 0) {
        const warnings = result.messages
          .filter((m) => m.type === 'warning')
          .map((m) => m.message);

        if (warnings.length > 0) {
          this.logger.warn(`DOCX warnings for "${filePath}": ${warnings.join('; ')}`);
        }
      }

      if (!result.value || result.value.trim().length === 0) {
        this.logger.warn(`DOCX "${filePath}" extracted but text is empty`);
        throw new UnprocessableEntityException(
          'File DOCX không chứa nội dung text có thể đọc được.',
        );
      }

      const cleaned = this.cleanText(result.value);
      this.logger.log(`DOCX extracted: ${cleaned.charCount} chars`);

      return { ...cleaned, sourceType: 'docx' };
    } catch (err) {
      if (err instanceof UnprocessableEntityException) throw err;

      this.logger.error(`mammoth failed for "${filePath}"`, err);
      throw new UnprocessableEntityException(
        'Không thể parse nội dung DOCX. File có thể không phải định dạng .docx chuẩn hoặc bị hỏng.',
      );
    }
  }

  // ─── Text Cleanup ────────────────────────────────────────────

  /**
   * Chuẩn hóa text sau khi extract:
   * - Xóa ký tự không in được (control chars) trừ newline, tab
   * - Thu gọn nhiều dòng trắng liên tiếp thành 1 dòng trắng
   * - Thu gọn nhiều space liên tiếp thành 1 space
   * - Trim đầu cuối
   */
  private cleanText(raw: string): Omit<ExtractResult, 'sourceType'> {
    const text = raw
      // Xóa control chars (trừ \n \r \t)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Thu gọn space liên tiếp thành 1 space (giữ newline)
      .replace(/[^\S\n]+/g, ' ')
      // Thu gọn hơn 2 dòng trắng liên tiếp thành 1 dòng trắng
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const lines = text.split('\n');

    return {
      text,
      charCount: text.length,
      lineCount: lines.length,
    };
  }
}
