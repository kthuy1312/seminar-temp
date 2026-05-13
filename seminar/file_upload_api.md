# 📄 File Upload API — NestJS + Multer

> **Service:** `document-service` · **Port:** `3004`  
> **Thư mục:** `services/document-service/`

---

## Tổng quan

API cho phép upload file tài liệu (PDF, DOCX) lên server, lưu local vào thư mục `uploads/`, lưu metadata vào PostgreSQL qua Prisma, và trả về URL để download.

---

## Các file đã tạo / chỉnh sửa

| File | Mô tả |
|------|-------|
| `src/documents/dto/document.dto.ts` | Enum, constants, DTOs cho upload & query |
| `src/documents/documents.controller.ts` | Controller: multer config, routes upload/list/detail |
| `src/documents/documents.service.ts` | Business logic: validate, lưu DB, sinh URL |
| `src/common/filters/http-exception.filter.ts` | Global filter: bắt `MulterError` + `HttpException` |
| `src/main.ts` | Bootstrap: đăng ký filter, interceptor, serve static |
| `prisma/schema.prisma` | Enum `FileType` chỉ còn `pdf`, `docx`; `userId` optional |

---

## Endpoints

### `POST /api/documents/upload`

Upload file tài liệu.

**Request** — `multipart/form-data`:

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `file` | File | ✅ | File PDF hoặc DOCX, tối đa 10 MB |
| `userId` | string (UUID v4) | ❌ | UUID người dùng (sẽ lấy từ JWT sau) |

**Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "fileName": "thesis.pdf",
    "fileType": "pdf",
    "fileSize": 1048576,
    "fileSizeFormatted": "1.00 MB",
    "url": "http://localhost:3004/api/documents/files/uuid.pdf",
    "uploadedAt": "2026-04-22T15:45:00.000Z"
  },
  "timestamp": "2026-04-22T15:45:00.000Z"
}
```

---

### `GET /api/documents`

Lấy danh sách tài liệu (có filter).

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `userId` | string | Lọc theo user |
| `fileType` | `pdf` \| `docx` | Lọc theo loại file |

---

### `GET /api/documents/:id`

Lấy chi tiết 1 tài liệu theo UUID.

---

### `GET /api/documents/files/:filename`

Download / truy cập file đã upload (static serving).

---

## Validate & Error Handling

### 3 lớp kiểm tra

```
Request
  │
  ├─ [1] fileFilter (multer)
  │       └─ Kiểm tra extension (.pdf/.docx) + MIME type
  │          → 415 Unsupported Media Type nếu sai
  │
  ├─ [2] limits (multer)
  │       └─ fileSize: 10 MB, files: 1
  │          → MulterError → 413 Payload Too Large
  │
  └─ [3] DocumentsService
          └─ Double-check extension + size (phòng bypass)
             → 400 Bad Request nếu sai
```

### Bảng lỗi

| Tình huống | HTTP Status | Message |
|-----------|-------------|---------|
| Không gửi file | `400 Bad Request` | File không được để trống |
| Sai định dạng (không phải PDF/DOCX) | `415 Unsupported Media Type` | Chỉ chấp nhận file PDF hoặc DOCX |
| File > 10 MB | `413 Payload Too Large` | File quá lớn. Kích thước tối đa là 10 MB |
| Sai field name trong form | `400 Bad Request` | Dùng field name là "file" trong form-data |
| `userId` không phải UUID | `400 Bad Request` | userId phải là UUID hợp lệ |
| `fileType` query không hợp lệ | `400 Bad Request` | fileType phải là: pdf, docx |
| ID document không tồn tại | `404 Not Found` | Document với id "..." không tồn tại |
| Lỗi DB khi lưu | `500 Internal Server Error` | Không thể lưu thông tin file vào CSDL |

### Format response lỗi

```json
{
  "success": false,
  "statusCode": 415,
  "message": "Chỉ chấp nhận file PDF hoặc DOCX. Bạn upload: \"virus.exe\"",
  "timestamp": "2026-04-22T15:45:00.000Z",
  "path": "/api/documents/upload"
}
```

---

## Cấu hình Multer

```typescript
// Lưu file vào: <project_root>/uploads/<uuid>.<ext>
diskStorage({ destination: 'uploads/', filename: uuid + ext })

fileFilter:
  - Kiểm tra extname: chỉ .pdf, .docx
  - Kiểm tra MIME: application/pdf | application/vnd.openxmlformats-...

limits:
  - fileSize: 10 * 1024 * 1024  // 10 MB
  - files: 1                     // 1 file/request
```

---

## Prisma Schema

```prisma
enum FileType {
  pdf
  docx
}

model Document {
  id         String    @id @default(uuid()) @db.Uuid
  userId     String?   @map("user_id") @db.Uuid   // optional, JWT sau
  fileName   String    @map("file_name") @db.VarChar(255)
  fileType   FileType  @map("file_type")
  filePath   String    @map("file_path") @db.Text
  fileSize   BigInt    @map("file_size")
  uploadedAt DateTime  @default(now()) @map("uploaded_at")

  @@index([userId])
  @@index([fileType])
  @@index([uploadedAt])
  @@map("documents")
}
```

---

## Chạy service

```bash
cd services/document-service

# Cài dependencies (nếu chưa)
npm install

# Tạo migration sau khi sửa schema
npx prisma migrate dev --name restrict-filetype-pdf-docx

# Chạy dev
npm run start:dev
```

> **Lưu ý:** Nếu DB cũ đã có bản ghi với `fileType` là `txt`, `pptx`, `xlsx` — cần xử lý data migration thủ công trước khi chạy `migrate dev`.

---

## Test nhanh với curl

```bash
# Upload PDF
curl -X POST http://localhost:3004/api/documents/upload \
  -F "file=@./sample.pdf" \
  -F "userId=3fa85f64-5717-4562-b3fc-2c963f66afa6"

# Upload file sai định dạng → 415
curl -X POST http://localhost:3004/api/documents/upload \
  -F "file=@./image.png"

# Danh sách documents
curl http://localhost:3004/api/documents?fileType=pdf

# Chi tiết
curl http://localhost:3004/api/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6
```
