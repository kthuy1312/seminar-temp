# Hướng dẫn Phát triển & Giải thích Kiến trúc AI Tutor Service

Tài liệu này giải thích chi tiết về cách thức hoạt động, kiến trúc và các quyết định thiết kế khi triển khai **AI Tutor Service** bằng NestJS.

## 1. Tổng quan Luồng xử lý (Data Flow)
Khi một người dùng gửi một câu hỏi lên hệ thống (POST `/tutor/ask`), luồng dữ liệu sẽ đi qua các bước sau:
1. **Nhận Request**: Controller nhận `documentId`, `question`, và tùy chọn `conversationId`.
2. **Lấy Context (Summary)**: Dịch vụ gọi sang **Summary Service** thông qua HTTP (sử dụng `@nestjs/axios`) để lấy bản tóm tắt của tài liệu. Đây là bước cực kỳ quan trọng để cung cấp ngữ cảnh (context) cho AI.
3. **Quản lý Lịch sử Chat (Database)**: 
   - Nếu có `conversationId`, hệ thống lấy lịch sử các tin nhắn cũ từ CSDL PostgreSQL.
   - Nếu chưa có, hệ thống tạo mới một phiên `Conversation`.
   - Lưu câu hỏi của người dùng vào bảng `Message`.
4. **Xây dựng Prompt & Gọi AI**: Ghép (Summary + Lịch sử Chat + Câu hỏi) thành một prompt hoàn chỉnh và gửi tới **Gemini API** qua SDK `@google/generative-ai`.
5. **Lưu & Trả kết quả**: Lưu câu trả lời của AI vào bảng `Message` và trả về cho người dùng.

---

## 2. Thiết kế Cơ sở dữ liệu (Prisma)
Chúng ta áp dụng mô hình quan hệ **1-N** (Một - Nhiều) giữa `Conversation` và `Message`.

- **Conversation (Phiên hỏi đáp)**: Đại diện cho một luồng trò chuyện xoay quanh một tài liệu (`documentId`).
- **Message (Tin nhắn)**: Chứa nội dung từng câu hỏi của người dùng và câu trả lời của AI. Phân biệt thông qua trường `role` ('user' hoặc 'ai').

**Lý do thiết kế**: Việc tách riêng `Message` giúp AI có khả năng duy trì ngữ cảnh của cuộc trò chuyện. Nếu người dùng hỏi các câu hỏi nối tiếp nhau (follow-up questions), AI sẽ đọc lại các tin nhắn cũ để hiểu ý định hiện tại.

---

## 3. Chiến lược Xây dựng Prompt (Prompt Engineering)

Prompt gửi đi cho Gemini được thiết kế với 3 phần chính để đảm bảo AI trả lời chính xác và không bịa đặt thông tin (Hallucination):

1. **Định danh Hệ thống (System Persona)**:
   > "Bạn là một trợ lý AI học tập thông minh..."
2. **Ngữ cảnh Cốt lõi (Core Context)**: Đưa bản tóm tắt (`summary`) nhận được từ Summary Service vào trực tiếp trong prompt, giới hạn trong dấu ngoặc kép `"""`.
3. **Ngữ cảnh Giao tiếp (Conversation History)**: Truyền lại lịch sử trò chuyện cũ để AI hiểu flow.
4. **Hướng dẫn Cụ thể (Instructions)**:
   > "Nếu câu trả lời không có trong bản tóm tắt, hãy sử dụng kiến thức chung để trả lời nhưng nhớ báo cho người dùng biết..."

*Mẫu code:*
```javascript
const prompt = \`Bạn là một trợ lý AI học tập thông minh (AI Study Assistant).
Dưới đây là bản tóm tắt nội dung của một tài liệu học tập:
"""
\${summary}
"""

\${historyContext}
...
Câu hỏi của người dùng: \${question}
Trả lời:\`;
```

---

## 4. Xử lý ngoại lệ và Lỗi (Error Handling)
Dịch vụ được thiết kế với độ chịu lỗi (fault-tolerance) cơ bản:
- **Lỗi 404 (NotFoundException)**: Trả về khi `documentId` không tồn tại trên Summary Service, hoặc `conversationId` không hợp lệ.
- **Lỗi 500 (InternalServerErrorException)**: Trả về khi API AI của Google bị lỗi, hoặc cấu hình `GEMINI_API_KEY` bị thiếu trên hệ thống. Tránh việc rò rỉ stack trace lỗi ra cho client.

## 5. Mở rộng trong tương lai
- **Caching**: Tích hợp Redis để cache lại kết quả Summary từ Summary Service, giảm tải HTTP request.
- **Vector Database (RAG)**: Thay vì chỉ dùng Text Summary, có thể dùng Langchain và Vector DB (như Pinecone / pgvector) để tìm kiếm các đoạn text liên quan nhất cho các tài liệu quá dài vượt giới hạn Token của Gemini.
