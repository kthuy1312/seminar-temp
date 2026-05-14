# Giải thích Unit Test cho Tutor Service (Jest)

Để đảm bảo tính đúng đắn và độ ổn định của hệ thống, tôi đã triển khai các Unit Test cho phương thức `askQuestion` của `TutorService` sử dụng framework **Jest**.

## 1. Mục tiêu của Unit Test

Việc test tập trung vào việc mô phỏng (mocking) các dependencies bên ngoài để kiểm tra logic nội bộ của Service mà không cần gọi DB thực hay AI thực:
- `HttpService`: Giả lập phản hồi từ Summary Service.
- `PrismaService`: Giả lập các hành vi của Database.
- `GoogleGenerativeAI`: Giả lập kết quả trả về từ Gemini API.

## 2. Giải thích 3 Test Cases Chính

### Test 1: Hỏi câu hỏi hợp lệ (Thành công - Happy Path)
- **Kịch bản**: Người dùng gửi câu hỏi, hệ thống lấy được bản tóm tắt, lưu DB và AI trả về câu trả lời.
- **Cách test**:
  - Mock `httpService.get` trả về `summary` hợp lệ.
  - Mock `mockPrismaService.conversation.create` và `message.create`.
  - Mock `mockGenAIModel.generateContent` trả về một chuỗi string.
- **Kỳ vọng (Expectations)**:
  - Hàm `httpService.get` phải được gọi đúng với `documentId`.
  - Hàm `message.create` phải được gọi đúng **2 lần** (lưu câu hỏi của user và lưu câu trả lời của AI).
  - Kết quả trả về phải khớp với `conversationId` và nội dung AI trả về.

### Test 2: Summary rỗng (Lỗi 404 - Bắt Exception)
- **Kịch bản**: Gọi sang Summary Service nhưng nhận về Object rỗng (tài liệu chưa được tóm tắt).
- **Cách test**:
  - Mock `httpService.get` trả về data `{}`.
- **Kỳ vọng**:
  - Phải ném ra lỗi `NotFoundException`.
  - **Quan trọng**: Hàm tạo DB (`conversation.create`) và hàm gọi AI (`generateContent`) **KHÔNG** được gọi, để tránh lưu rác vào DB hoặc lãng phí chi phí gọi API. (Sử dụng `expect(...).not.toHaveBeenCalled()`).

### Test 3: AI lỗi (Lỗi 500 - Bắt Exception)
- **Kịch bản**: Mọi thứ hợp lệ, nhưng khi gọi tới Gemini thì API bị lỗi (do hết quota, rớt mạng...).
- **Cách test**:
  - Mock `mockGenAIModel.generateContent` thành `mockRejectedValue(new Error(...))`.
- **Kỳ vọng**:
  - Ném ra `InternalServerErrorException`.
  - Hàm lưu tin nhắn `message.create` chỉ được gọi **1 lần** duy nhất (chỉ lưu được tin nhắn người dùng, tin nhắn AI không được sinh ra).

## 3. Cách chạy Test
Bạn có thể chạy các test này bằng lệnh:
```bash
npm run test -- src/tutor/tutor.service.spec.ts
```
