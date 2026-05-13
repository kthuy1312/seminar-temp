# 📝 Summary Service — AI Study Assistant

> **Service:** `summary-service`  
> **Database:** PostgreSQL (Prisma)  
> **Broker:** RabbitMQ  
> **AI:** Gemini (Google Generative AI)

---

## 🎯 Tổng quan

`Summary Service` đóng vai trò tiêu thụ event sinh ra từ `Document Service` và gọi API của AI để tạo ra bản tóm tắt nội dung tài liệu một cách tự động. Sau khi có kết quả, tóm tắt sẽ được lưu vào cơ sở dữ liệu và có thể truy xuất qua API.

---

## 🧩 Cấu trúc hệ thống & Thiết kế

### 1. Database Schema (Prisma)
- **Model `Summary`**:
  - `id`: UUID (Khóa chính)
  - `documentId`: UUID (Tham chiếu tới tài liệu bên Document Service)
  - `content`: Text (Lưu trữ nội dung AI đã tóm tắt)
  - `createdAt`: DateTime (Thời điểm tóm tắt)

### 2. Các Module chính (`src/`)
- **`PrismaModule`**: Kết nối và quản lý vòng đời (Lifecycle) của DB connection.
- **`AiModule` (`AiService`)**: Bọc SDK `@google/generative-ai`. Khởi tạo model `gemini-1.5-pro` và gửi Prompt tóm tắt bằng tiếng Việt.
- **`SummaryModule`**: 
  - **`SummaryController`**: Xử lý cả HTTP REST endpoint và RabbitMQ MessagePattern.
  - **`SummaryService`**: Chứa Business Logic cốt lõi.

---

## 🌊 Flow Xử Lý Event (`document.uploaded`)

Khi nhận được event từ RabbitMQ, `SummaryService.handleDocumentUploaded()` sẽ chạy nền (background job) qua các bước sau:

1. **Nhận Event**: Lấy `document_id` và `extracted_text` từ payload.
2. **Kiểm tra/Bổ sung Text**: 
   - Nếu `extracted_text` trống, Service sẽ bắn HTTP POST request qua `Document Service` (`GET /api/documents/:id/extract`) để lấy lại chữ.
   - Nếu vẫn trống (ví dụ file scan ảnh không có text), hệ thống dừng xử lý và log warning.
3. **Gọi AI (Gemini)**: Gửi nội dung text thô lên Google Gemini kèm một Prompt yêu cầu tóm tắt bằng tiếng Việt rõ ràng, xúc tích.
4. **Lưu Database**: Kết quả trả về từ AI được lưu trực tiếp xuống bảng `summaries` trong PostgreSQL để tái sử dụng mà không cần gọi lại AI.

---

## 🌐 Các API Endpoints

### 1. Lấy Tóm Tắt của một Document

```http
GET /api/summaries/document/:documentId
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "uuid-cua-summary",
    "documentId": "uuid-cua-document",
    "content": "Đây là bản tóm tắt nội dung tài liệu...",
    "createdAt": "2026-04-22T10:00:00.000Z"
  }
}
```
*(Nếu chưa có summary, trả về 404 Not Found)*

---

## ⚙️ Cấu hình môi trường (.env)

```env
# URL DB PostgreSQL
DATABASE_URL="postgresql://postgres:123456@localhost:5432/summary_db"

# URL kết nối RabbitMQ
RABBITMQ_URL="amqp://localhost:5672"

# Token AI của Google
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Port HTTP của Service
PORT=3005
```

---

## 🛠 Cách chạy Service

1. Đảm bảo cấu hình đúng các biến môi trường trong `.env`.
2. Chạy lệnh cài đặt và đồng bộ DB:
   ```bash
   npm install
   npx prisma db push
   ```
3. Chạy service:
   ```bash
   npm run start:dev
   ```
