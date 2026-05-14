# 🔄 Tự động Extract Text khi Upload

> **Service:** `document-service`

---

## 🎯 Tổng quan

Đã cập nhật logic của `Document Service` để:
1. **Tự động extract text** từ file ngay sau khi file được upload lên disk.
2. **Lưu nội dung text** trực tiếp vào database trong cùng một bước với việc lưu metadata.
3. **Đảm bảo tính linh hoạt:** Nếu việc extract thất bại (ví dụ: file PDF scan), tiến trình upload vẫn sẽ thành công, trường `extracted_text` sẽ được lưu là `null`, và lỗi extract sẽ được ghi lại trong log.
4. **Cập nhật Endpoint Extract Manual:** Endpoint `POST /api/documents/:id/extract` giờ đây ngoài việc trả về text còn cập nhật lại text mới extract vào database.

---

## 📂 Các file đã thay đổi

| File | Thay đổi |
|------|----------|
| `prisma/schema.prisma` | Thêm trường `extractedText String? @map("extracted_text") @db.Text` vào model `Document` |
| `src/documents/documents.service.ts` | Cập nhật method `upload` để tự động gọi `textExtractor.extract()`. <br> Cập nhật method `extractText` để lưu text vào DB. |

---

## ⚙️ Logic Upload Mới

Quy trình Upload file hiện tại diễn ra như sau:
1. File đi qua Multer (`fileFilter` check MIME/ext, `limits` check size max 10MB).
2. Service nhận file, tiến hành double-check extension và file size.
3. **[Mới]** Gọi `TextExtractorService` để đọc text từ `file.path`.
    - Dùng `try...catch` để bọc việc extract.
    - Nếu thành công, gán giá trị text vào biến `extractedText`.
    - Nếu thất bại, log warning và để `extractedText = null`.
4. Gọi Prisma `create` để lưu metadata của file cùng với trường `extractedText` vào cơ sở dữ liệu `documents`.

### 💡 Lợi ích
- File được phân tích nội dung ngay lập tức.
- Client hoặc các service khác (như AI, Search) có thể query nội dung text ngay sau khi upload mà không cần gọi API phụ để extract.
- Tránh tình trạng data rác: nếu upload fail ở DB, mọi thứ bị rollback.

---

## 🔧 Database Migration

Do thêm trường mới `extracted_text` vào schema, schema đã được sync thông qua Prisma:

```prisma
model Document {
  // ...
  extractedText  String?  @map("extracted_text") @db.Text
  // ...
}
```

(Đã chạy `npx prisma db push --accept-data-loss` và `npx prisma generate`).

---

## 📌 Cách Test

Bạn có thể test API tương tự như trước, luồng xử lý ở Backend sẽ tự động làm phần việc còn lại:

```bash
# Upload PDF
curl -X POST http://localhost:3004/api/documents/upload \
  -F "file=@./sample.pdf"

# Database lúc này đã tự động lưu field `extracted_text`.

# Nếu bạn muốn trigger lại việc extract và update vào DB thủ công:
curl -X POST http://localhost:3004/api/documents/<id>/extract
```
