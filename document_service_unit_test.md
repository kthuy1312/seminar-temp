# 🧪 Unit Testing — Document Service

> **Service:** `document-service`  
> **Framework:** `Jest`

---

## 🎯 Tổng quan

Đã thực hiện viết Unit Test cho `DocumentsService` tập trung vào method quan trọng nhất là `upload()`. Các dependencies (như `PrismaService`, `TextExtractorService`, và `RABBITMQ_CLIENT`) đều được mock để đảm bảo test chạy độc lập, nhanh và không làm thay đổi trạng thái của database thực tế.

---

## 📂 Các file đã tạo / chỉnh sửa

| File | Thay đổi |
|------|----------|
| `src/documents/documents.service.spec.ts` | **Tạo mới** — Chứa toàn bộ các test cases cho `DocumentsService`. |
| `jest.config.js` | Tạo cấu hình để Jest có thể biên dịch TypeScript thông qua `ts-jest`. |

---

## 🧪 Các Test Cases Đã Viết

Các kịch bản (scenarios) đã được cover trong unit test:

### 1. Upload thành công (Happy Path)
- **Đầu vào:** Một file PDF hợp lệ với dung lượng < 10MB.
- **Kỳ vọng:**
  - Gọi hàm trích xuất text (`textExtractor.extract`).
  - Lưu thành công vào DB thông qua (`prisma.document.create`) với trường `extractedText` chính xác.
  - Gọi hàm phát sự kiện lên RabbitMQ (`rabbitClient.emit`) với đúng `document_id` và `extracted_text`.
  - Trả về object chứa `url` để download file.

### 2. Sai File Type (Định dạng không được hỗ trợ)
- **Đầu vào:** Một file không phải `.pdf` hay `.docx` (ví dụ: `.exe`).
- **Kỳ vọng:**
  - Ném ra ngoại lệ `BadRequestException` kèm theo message báo lỗi.
  - **Không** gọi bất kỳ dependency nào (Prisma, TextExtractor, RabbitMQ) để đảm bảo tối ưu tài nguyên.

### 3. File quá lớn (Exceed Max Size Limit)
- **Đầu vào:** Một file PDF có dung lượng 15MB (giới hạn là 10MB).
- **Kỳ vọng:**
  - Ném ra ngoại lệ `BadRequestException` thông báo quá dung lượng.
  - Tương tự, **Không** gọi Prisma, TextExtractor, hoặc RabbitMQ.

### 4. Upload thành công nhưng Extract Text thất bại (Graceful Degradation)
- **Đầu vào:** File PDF hợp lệ nhưng không thể đọc được nội dung (ví dụ: PDF ảnh chụp/scan).
- **Kỳ vọng:**
  - `TextExtractorService` ném ra lỗi.
  - Tuy nhiên, luồng hệ thống tự phục hồi (bắt lỗi trong try-catch) và vẫn **cho phép upload thành công**.
  - Lưu vào DB thông qua Prisma nhưng trường `extractedText` nhận giá trị `null`.
  - Vẫn phát event RabbitMQ nhưng payload mang `extracted_text: null`.

---

## 🛠 Cách chạy Test

Chạy lệnh sau tại thư mục gốc của service (`services/document-service`):

```bash
# Chạy một lần
npm test

# Chạy và watch code thay đổi
npm run test:watch
```

> Output mẫu khi chạy thành công:
> ```
> PASS  src/documents/documents.service.spec.ts
>   DocumentsService
>     √ should be defined
>     upload
>       √ 1. Upload thành công (successful upload)
>       √ 2. Sai file type (wrong file type - throw BadRequestException)
>       √ 3. File quá lớn (file too large - throw BadRequestException)
>       √ Upload thành công nhưng extract text thất bại
> ```
