# Triển khai Tích hợp Gemini API trong Summary Service

Tài liệu này tóm tắt các thay đổi và cài đặt cho chức năng tóm tắt văn bản bằng Gemini API trong `AiService` thuộc `summary-service`.

## 1. Yêu cầu của bài toán

- **Input:** Chuỗi văn bản (text) cần tóm tắt.
- **Output:** Tóm tắt gồm đúng **5 ý chính**, định dạng gạch đầu dòng.
- **Các yêu cầu kỹ thuật đi kèm:**
  - Có cơ chế **Timeout** để tránh treo request.
  - Có cơ chế **Retry** khi gặp lỗi mạng tạm thời (đặc biệt là lỗi `503 Service Unavailable`).

## 2. Giải pháp đã thực hiện

File thực hiện thay đổi: `src/ai/ai.service.ts`.

### 2.1. Cập nhật Prompt
Để đảm bảo đầu ra là 5 ý chính, nội dung biến `prompt` đã được cập nhật cụ thể yêu cầu hướng dẫn cho model:
> *"Bạn là một trợ lý AI học tập xuất sắc. Hãy tóm tắt nội dung tài liệu sau đây thành đúng 5 ý chính. Trình bày bằng tiếng Việt, dưới dạng danh sách gạch đầu dòng:..."*

### 2.2. Xử lý Timeout bằng `AbortController`
Để quản lý việc timeout một cách chặt chẽ từ phía Node.js:
- Sử dụng `AbortController` tích hợp sẵn của Node.js.
- Một timer `setTimeout` được khởi tạo bằng `timeoutMs = 15000` (15 giây).
- Tín hiệu `controller.signal` được truyền thẳng vào cấu hình request của thư viện Google Generative AI (`{ signal: controller.signal }`).
- Nếu trong 15 giây mà request không có phản hồi, `setTimeout` sẽ chạy lệnh `controller.abort(new Error('RequestTimeout'))`, ngắt kết nối API ngay lập tức và ném ra Exception `AbortError` / `RequestTimeout`.

### 2.3. Cơ chế Retry khi gặp lỗi 503 (Exponential Backoff)
Để đảm bảo tính bền vững (resilience) cho service:
- Function được thiết kế vòng lặp `for` với số lần thử tối đa là `maxRetries = 3`.
- Bất cứ khi nào nhận được lỗi từ API, function sẽ bắt `catch`:
  - **Nếu là lỗi 503** (Service Unavailable) hoặc Timeout: Code sẽ log ra thông báo, không văng lỗi ngay (nếu vẫn còn số lượt Retry).
  - **Tính toán thời gian đợi (Exponential Backoff):** Thời gian chờ giữa mỗi lần gọi lại tăng lên theo lũy thừa 2 (Ví dụ: `Math.pow(2, attempt) * 1000`), tương đương với việc đợi 2s, 4s, 8s trước lần thử tiếp theo.
  - Sau thời gian đợi, hệ thống tiếp tục chu kỳ vòng lặp gọi lại Gemini. Nếu vượt quá 3 lần vẫn lỗi, hệ thống mới chính thức `throw Error` để trả về cho người dùng.

## 3. Lợi ích của thiết kế

- **Kháng lỗi (Fault Tolerant):** Đảm bảo service tóm tắt không bị chết hoặc treo máy chủ khi có sự cố từ mạng hoặc khi server Google đang bị quá tải (503).
- **Trải nghiệm người dùng:** Việc áp đặt Timeout giúp người dùng không phải chờ đợi vô thời hạn nếu dịch vụ API bên thứ 3 chậm trễ.
- **Tuân thủ Clean Code:** Tách biệt rõ ràng vòng đời của một Request với các logic quản lý lỗi, dùng Backoff chuẩn trong hệ thống phân tán (Microservices).
