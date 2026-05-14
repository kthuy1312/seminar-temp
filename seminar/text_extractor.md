# 📝 Text Extractor — PDF & DOCX

> **Service:** `document-service` · **File:** `src/documents/text-extractor.service.ts`  
> **Packages:** `pdf-parse@1.1.1` · `mammoth`

---

## Tổng quan

Module extract nội dung text thuần từ file PDF và DOCX đã upload.  
Được thiết kế như một NestJS injectable service riêng biệt để dễ tái sử dụng (ví dụ: pipeline AI, indexing).

---

## File đã tạo / chỉnh sửa

| File | Thay đổi |
|------|----------|
| `src/documents/text-extractor.service.ts` | **Tạo mới** — core logic extract PDF + DOCX |
| `src/documents/documents.module.ts` | Đăng ký `TextExtractorService` vào providers + exports |
| `src/documents/documents.service.ts` | Inject `TextExtractorService`, thêm method `extractText(id)` |
| `src/documents/documents.controller.ts` | Thêm endpoint `POST /api/documents/:id/extract` |
| `tsconfig.json` | Thêm `"esModuleInterop": true` để import CJS module |
| `package.json` | Thêm `pdf-parse@1.1.1`, `mammoth`, `@types/pdf-parse` |

---

## Endpoint

### `POST /api/documents/:id/extract`

Đọc file từ disk theo `id` trong DB, extract và trả về plain text.

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "text": "Nội dung văn bản thuần của tài liệu...",
    "charCount": 15240,
    "lineCount": 312,
    "sourceType": "pdf"
  },
  "timestamp": "2026-04-22T16:00:00.000Z"
}
```

---

## Kiến trúc `TextExtractorService`

```
extract(filePath, originalName)
    │
    ├─ .pdf  →  extractFromPdf()
    │               ├─ readFile() → Buffer
    │               ├─ pdfParse(buffer) → data.text
    │               ├─ Check empty (scan/image PDF)
    │               └─ cleanText() → ExtractResult
    │
    ├─ .docx →  extractFromDocx()
    │               ├─ readFile() → Buffer
    │               ├─ mammoth.extractRawText({ buffer })
    │               ├─ Log warnings (font không nhận dạng…)
    │               ├─ Check empty
    │               └─ cleanText() → ExtractResult
    │
    └─ khác  →  UnprocessableEntityException (415)
```

---

## Packages & Lý do chọn

| Package | Version | Lý do |
|---------|---------|-------|
| `pdf-parse` | `1.1.1` | Parse PDF → text, hỗ trợ multi-page, encoding. **Phải dùng v1.1.1** — v7+ đã thay đổi API hoàn toàn và không ổn định |
| `mammoth` | latest | DOCX → plain text, bỏ qua toàn bộ styling. API ổn định, hỗ trợ buffer |

> ⚠️ **Lưu ý quan trọng:** `pdf-parse@7.x` export là object thay vì function, gây `TS2349: This expression is not callable`. **Luôn pin version `pdf-parse@1.1.1`**.

---

## Return type — `ExtractResult`

```typescript
interface ExtractResult {
  text: string;         // Toàn bộ text thuần, đã được chuẩn hóa
  charCount: number;    // Số ký tự (sau khi trim)
  lineCount: number;    // Số dòng
  sourceType: 'pdf' | 'docx';
}
```

---

## Text Cleanup Pipeline

Áp dụng sau khi extract từ cả hai loại file:

```
raw text
  │
  ├─ Xóa control chars (ASCII 0x00–0x1F trừ \n \r \t)
  ├─ Thu gọn nhiều space liên tiếp → 1 space (giữ nguyên \n)
  ├─ Thu gọn ≥3 dòng trắng liên tiếp → 2 dòng trắng
  └─ trim() đầu/cuối
```

---

## Error Handling

| Tình huống | HTTP Status | Message |
|-----------|-------------|---------|
| `id` không tồn tại trong DB | `404 Not Found` | Document với id "..." không tồn tại |
| File bị xóa / không đọc được | `422 Unprocessable Entity` | Không thể đọc file PDF/DOCX |
| PDF là ảnh scan (không có text layer) | `422 Unprocessable Entity` | File PDF không chứa text có thể đọc được. Cần OCR |
| PDF bị mã hóa / lỗi cấu trúc | `422 Unprocessable Entity` | Không thể parse nội dung PDF |
| DOCX không chuẩn định dạng | `422 Unprocessable Entity` | Không thể parse nội dung DOCX |
| DOCX extract rỗng | `422 Unprocessable Entity` | File DOCX không chứa nội dung text |
| Extension không phải .pdf/.docx | `422 Unprocessable Entity` | Không hỗ trợ extract text từ định dạng "..." |

> Tất cả lỗi đều được bắt bởi `HttpExceptionFilter` global, trả về cùng format `{ success: false, statusCode, message }`.

---

## Hạn chế đã biết

| Hạn chế | Giải thích |
|---------|-----------|
| PDF scan / ảnh | `pdf-parse` chỉ đọc text layer. PDF từ máy scan cần OCR (Tesseract, AWS Textract…) |
| DOCX có table phức tạp | `mammoth.extractRawText` lấy text từng cell tuần tự, không giữ cấu trúc bảng |
| DOCX có header/footer | mammoth mặc định bỏ qua header/footer |
| Password-protected PDF | `pdf-parse` throw lỗi → bắt và trả `422` |

---

## Test nhanh với curl

```bash
# Bước 1: Upload file
curl -X POST http://localhost:3004/api/documents/upload \
  -F "file=@./sample.pdf"

# Lấy id từ response, ví dụ: "3fa85f64-..."

# Bước 2: Extract text
curl -X POST http://localhost:3004/api/documents/3fa85f64-.../extract

# Extract từ DOCX
curl -X POST http://localhost:3004/api/documents/upload \
  -F "file=@./report.docx"
curl -X POST http://localhost:3004/api/documents/<id>/extract
```

---

## Hướng phát triển tiếp theo

- [ ] Lưu extracted text vào DB (`content TEXT` field trong `Document` model) để tránh extract lại
- [ ] Thêm OCR fallback cho PDF scan (Tesseract.js hoặc call external service)
- [ ] Thêm endpoint `GET /api/documents/:id/extract` để trả lại text đã cache từ DB
- [ ] Stream text thay vì load toàn bộ vào memory (cho file lớn)
