# Unit Test cho Summary Service

Tài liệu này giải thích cấu trúc và các ca kiểm thử (test cases) bằng Jest để đảm bảo `SummaryService` hoạt động đúng theo các yêu cầu: nhận sự kiện, trích xuất text, và gọi AI.

## 1. Cấu hình Mock (Test Double)
Bởi vì đây là Unit Test, ta không thực sự gọi đến Database, API bên thứ 3 (Gemini), hay RabbitMQ. Chúng được "giả lập" (mock) như sau:
- `PrismaService`: Mock hàm `create` để luôn trả về thành công thay vì kết nối PostgreSQL.
- `AiService`: Mock hàm `summarizeText` trả về một chuỗi văn bản mẫu.
- `axios`: Mock hàm `axios.post` để giả định kết quả trả về từ `Document Service` khi cần lấy nội dung text.

## 2. Các kịch bản kiểm thử (Test Cases)

File đã tạo: `src/summary/summary.service.spec.ts`

### Test 1: Nhận event thành công, extract text (có sẵn) OK và gọi AI OK
**Kịch bản:** Payload truyền tới qua RabbitMQ đã chứa sẵn thuộc tính `extracted_text`. 
- **Kỳ vọng:**
  - Service lấy text trực tiếp từ payload (Extract Text OK).
  - Không gọi hàm `axios.post` (để tối ưu hóa API call).
  - Hàm `aiService.summarizeText` được gọi chính xác 1 lần với text đó.
  - Hàm lưu vào DB `prismaService.summary.create` được gọi thành công.

### Test 2: Extract text OK (bằng việc gọi Document Service) và gọi AI OK
**Kịch bản:** Payload từ RabbitMQ bị khuyết mất `extracted_text` (trị giá undefined).
- **Kỳ vọng:**
  - Service phải gọi `axios.post` tới `document-service` để lấy text.
  - Hàm `aiService.summarizeText` sẽ nhận đúng đoạn text được giả lập trả về từ Axios.
  - Sau khi AI xử lý, lưu xuống DB thành công.

### Test 3: Xử lý khi AI báo lỗi
**Kịch bản:** Văn bản đầu vào hợp lệ nhưng thư viện AI quăng lỗi (VD: Hết hạn mức API, rớt mạng).
- **Kỳ vọng:** 
  - Hàm catch bắt được lỗi.
  - Dòng lệnh lưu DB (`prisma.summary.create`) **KHÔNG** được gọi, bảo vệ tính toàn vẹn của cơ sở dữ liệu.

## 3. Cách chạy Test
Bạn có thể chạy kiểm thử chỉ cho thư mục này thông qua terminal:
```bash
npm run test -- summary.service.spec.ts
```
