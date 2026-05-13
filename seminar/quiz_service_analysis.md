# Phân tích Thiết kế và Triển khai Quiz Service

Tài liệu này giải thích chi tiết về luồng nghiệp vụ, kiến trúc và cách tương tác với Gemini AI được sử dụng trong **Quiz Service**.

## 1. Kiến trúc Hệ thống (Architecture)

Quiz Service được xây dựng như một Microservice độc lập trong kiến trúc tổng thể của AI Study Assistant.
*   **Framework**: NestJS giúp tách biệt các layer rõ ràng (Controller, Service, Module).
*   **Database**: PostgreSQL thông qua Prisma ORM đảm bảo Type-safety khi thao tác với dữ liệu.
*   **Tích hợp nội bộ**: Tương tác với `Summary Service` qua HTTP/Axios để lấy thông tin tóm tắt nội dung làm đầu vào cho bài Quiz.
*   **Tích hợp AI**: Sử dụng `@google/generative-ai` để sinh câu hỏi dựa trên ngữ cảnh.

---

## 2. Thiết kế Cơ sở Dữ liệu (Prisma Schema)

Cơ sở dữ liệu được thiết kế xoay quanh 3 Entity chính:
*   **`Quiz`**: Đóng vai trò là root entity, định danh cho một bộ câu hỏi sinh ra từ một `documentId`. 
*   **`Question`**: Lưu trữ các lựa chọn (dưới dạng mảng `JSON`), câu trả lời đúng và lời giải thích. Việc dùng JSON cho mảng `options` giúp đơn giản hóa số lượng bảng cần thiết mà vẫn giữ được tính linh hoạt khi đổi template số lượng đáp án.
*   **`QuizAttempt`**: Ghi nhận lại mỗi lần người dùng làm bài. Lưu lại `score` (điểm số), `total` (tổng câu), và chi tiết từng `answers` người dùng đã điền. Phục vụ cho tính năng lịch sử làm bài.

---

## 3. Phân tích Prompt Engineering cho Gemini AI

Trái tim của hệ thống tạo Quiz là prompt gửi tới Gemini AI (phiên bản `gemini-1.5-pro`). Prompt được thiết kế cực kỳ khắt khe:

```text
Based on the following summary, generate 5 multiple-choice questions.
Provide the result as a JSON array where each object has:
- questionText: string
- options: string[] (array of 4 options)
- correctAnswer: string (the exact text of the correct option)
- explanation: string (why the answer is correct)

Summary:
{summaryText}

Return ONLY the JSON array.
```

> [!IMPORTANT]
> **Ý nghĩa của Prompt:**
> 1. **Context-Aware**: Đưa thẳng `{summaryText}` vào ngữ cảnh để câu hỏi không bị lan man, đúng vào trọng tâm của document.
> 2. **Structural Enforcement**: Bắt buộc AI trả về đúng một mảng JSON. Các field cần thiết như `options`, `correctAnswer`, `explanation` được định nghĩa rõ kiểu dữ liệu. Điều này rất quan trọng khi parse JSON ở phía code Node.js.
> 3. **Noise Reduction**: Câu lệnh `"Return ONLY the JSON array"` cố gắng ngăn AI sinh ra các text dạo đầu như "Here is the result...".

---

## 4. Xử lý phản hồi từ AI (Parsing & Error Handling)

Dù đã có câu lệnh giới hạn (Return ONLY...), đôi khi AI (Gemini) vẫn sẽ trả về JSON bị bọc trong markdown code block (\`\`\`json ... \`\`\`). Do đó, service phải có bước **tiền xử lý chuỗi (sanitize)**:

```typescript
const text = result.response.text();
// Loại bỏ các thẻ markdown markdown bao quanh JSON
const jsonStr = text.replace(/```json\n|\n```|```/g, '').trim();
const questions = JSON.parse(jsonStr);
```

**Chiến lược bắt lỗi (Error Handling):**
*   Trường hợp `Summary Service` bị lỗi hoặc không có summary cho document truyền vào -> Trả về `NotFoundException(404)`.
*   Trường hợp Gemini AI quá tải, limit rate, hoặc format sinh ra bị sai cấu trúc khi gọi `JSON.parse()` -> Bắt lỗi ở vòng catch và trả về `InternalServerErrorException(500)` để ngăn hệ thống sập và giấu lỗi cấu trúc khỏi Frontend.

---

## 5. API Flow - Luồng Nộp bài (Submit)

Logic chấm bài trong API `/quiz/submit` hoạt động ở backend nhằm chống gian lận:
1. Client gửi lên `quizId` và mảng `answers` (ánh xạ giữa `questionId` -> đáp án của user).
2. Backend truy vấn Database để lấy mảng `questions` kèm `correctAnswer`.
3. Backend so khớp: `if (answers[q.id] === q.correctAnswer) score++;`
4. Lưu toàn bộ `score`, `total` và payload người dùng gửi vào bảng `QuizAttempt`.
5. Trả kết quả bài chấm cho người dùng.

> [!TIP]
> Việc chấm điểm trên Backend giúp bảo mật đáp án chính xác. Mặc dù ở API `GET /quiz/:id` ta đang trả về cả `correctAnswer`, trong môi trường Producttion thực tế, biến này có thể bị loại bỏ (exclude) tại Prisma select khi trả về cho Frontend để đảm bảo tính minh bạch hoàn toàn.
