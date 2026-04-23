# Triển khai Function Node.js gọi Gemini API cho Q&A

Theo yêu cầu, đây là một hàm (function) Node.js độc lập, chuyên dùng để nhận `summary` và `question` làm input và trả về `answer` thông qua Gemini API.

## 1. Mã nguồn Function (Node.js)

Hàm dưới đây sử dụng thư viện chính thức `@google/generative-ai`. Bạn có thể lưu vào file `geminiQA.js` hoặc tích hợp vào Utils của dự án.

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Hàm gọi Gemini API để trả lời câu hỏi dựa trên bản tóm tắt
 * @param {string} summary - Bản tóm tắt tài liệu (Context)
 * @param {string} question - Câu hỏi của người dùng
 * @param {string} apiKey - Khóa API của Google Gemini
 * @returns {Promise<string>} - Câu trả lời từ AI
 */
async function askGeminiQA(summary, question, apiKey) {
  if (!apiKey) throw new Error("Yêu cầu phải có Gemini API Key!");

  try {
    // 1. Khởi tạo SDK và cấu hình Model
    const genAI = new GoogleGenerativeAI(apiKey);
    // Sử dụng gemini-1.5-flash vì tốc độ phản hồi nhanh, giá thành rẻ, phù hợp tác vụ Q&A text.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 2. Chèn biến vào Template Prompt
    const prompt = \`Bạn là một trợ lý AI học tập (AI Tutor) tận tâm và thông minh. Nhiệm vụ của bạn là giải đáp câu hỏi của học sinh dựa trên nội dung tóm tắt được cung cấp.

=== THÔNG TIN ĐẦU VÀO ===
- Tóm tắt tài liệu:
"""
\${summary}
"""

=== YÊU CẦU TRẢ LỜI ===
1. CHÍNH XÁC & NGẮN GỌN: Chỉ trả lời thẳng vào trọng tâm câu hỏi, không lan man.
2. DỄ HIỂU: Sử dụng ngôn từ đơn giản, thân thiện với người học.
3. CÓ VÍ DỤ: Luôn đi kèm 1-2 ví dụ thực tế hoặc minh hoạ cụ thể (nếu có thể) để làm rõ ý.
4. RÕ RÀNG: Trình bày sử dụng gạch đầu dòng hoặc đoạn văn ngắn.
5. TRUNG THỰC: Nếu câu trả lời KHÔNG nằm trong nội dung tóm tắt, hãy ghi rõ: "Nội dung này không được đề cập trong tài liệu hiện tại, nhưng theo tôi hiểu thì..."

=== CÂU HỎI HIỆN TẠI ===
Câu hỏi: \${question}

Hãy đưa ra câu trả lời:\`;

    // 3. Thực thi gọi API
    const result = await model.generateContent(prompt);
    
    // 4. Lấy kết quả text và trả về
    return result.response.text();
  } catch (error) {
    console.error('Lỗi trong quá trình gọi Gemini API:', error.message);
    throw error;
  }
}

module.exports = { askGeminiQA };
```

---

## 2. Giải thích Cách Phát triển

### A. Quy trình gọi API (Flow)
- **SDK Initialization**: Bắt buộc khởi tạo đối tượng `GoogleGenerativeAI` với API Key.
- **Model Selection**: Chọn model `gemini-1.5-flash`. Đây là phiên bản tối ưu hóa cho tốc độ và tác vụ Text-to-Text đơn giản như Q&A. Không cần dùng `gemini-1.5-pro` (đắt và chậm hơn) vì bài toán chỉ là đọc Summary và trả lời.
- **Promise Handling**: `generateContent` trả về một Promise. Phải dùng `await result.response.text()` để chiết xuất nội dung dạng chuỗi.

### B. Khả năng tái sử dụng (Reusability)
Việc tách riêng function như thế này giúp bạn:
- **Tách biệt Logic (Decoupling)**: Không bị phụ thuộc vào NestJS, TypeORM, hay Prisma.
- **Dễ dàng Test (Unit Testing)**: Dễ dàng mock (làm giả) kết quả của hàm mà không cần gọi DB.
- **Khả năng Scale**: Hàm này có thể chuyển thành 1 serverless function (AWS Lambda, Google Cloud Function) nếu cần.

### C. Ví dụ gọi thử (Usage Example)
```javascript
// index.js
const { askGeminiQA } = require('./geminiQA');

async function run() {
  const summary = "Chu trình nước bao gồm 4 giai đoạn chính: bay hơi, ngưng tụ, giáng thủy (mưa) và dòng chảy.";
  const question = "Mưa là giai đoạn nào?";
  
  const answer = await askGeminiQA(summary, question, "YOUR_API_KEY");
  console.log(answer);
}

run();
```
