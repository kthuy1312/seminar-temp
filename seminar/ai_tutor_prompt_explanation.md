# Thiết kế & Tối ưu Prompt cho AI Tutor

Dựa trên yêu cầu của bạn, tôi đã thiết kế lại một Prompt (câu lệnh chỉ thị cho AI) chuyên biệt và tối ưu dành riêng cho hệ thống **AI Tutor Service**.

## 1. Nội dung Prompt Mới

```javascript
const prompt = \`Bạn là một trợ lý AI học tập (AI Tutor) tận tâm và thông minh. Nhiệm vụ của bạn là giải đáp câu hỏi của học sinh dựa trên nội dung tóm tắt được cung cấp.

=== THÔNG TIN ĐẦU VÀO ===
- Tóm tắt tài liệu:
"""
\${summary}
"""
\${historyContext}

=== YÊU CẦU TRẢ LỜI ===
1. CHÍNH XÁC & NGẮN GỌN: Chỉ trả lời thẳng vào trọng tâm câu hỏi, không lan man.
2. DỄ HIỂU: Sử dụng ngôn từ đơn giản, thân thiện với người học.
3. CÓ VÍ DỤ: Luôn đi kèm 1-2 ví dụ thực tế hoặc minh hoạ cụ thể (nếu có thể) để làm rõ ý.
4. RÕ RÀNG: Trình bày sử dụng gạch đầu dòng hoặc đoạn văn ngắn.
5. TRUNG THỰC: Nếu câu trả lời KHÔNG nằm trong nội dung tóm tắt, hãy ghi rõ: "Nội dung này không được đề cập trong tài liệu hiện tại, nhưng theo tôi hiểu thì..."

=== CÂU HỎI HIỆN TẠI ===
Câu hỏi: \${question}

Hãy đưa ra câu trả lời:\`;
```

---

## 2. Giải thích Phương pháp Tối ưu (Prompt Engineering)

Prompt này được thiết kế theo cấu trúc chuẩn để tối đa hóa hiệu suất của mô hình ngôn ngữ lớn (LLM - như Gemini hay OpenAI):

### A. Định hình Vai trò (Persona Setting)
> *"Bạn là một trợ lý AI học tập (AI Tutor) tận tâm và thông minh..."*
- **Tác dụng**: Giúp AI tự điều chỉnh giọng văn (tone/voice) trở nên từ tốn, mang tính sư phạm và dễ gần với học sinh, không nói chuyện giống robot.

### B. Phân chia Cấu trúc Rõ ràng (Structured Sections)
Việc sử dụng các thẻ tiêu đề (ví dụ `=== THÔNG TIN ĐẦU VÀO ===`) giúp AI phân biệt rõ đâu là *dữ liệu* (Summary, History) và đâu là *nhiệm vụ* (Câu hỏi, Yêu cầu trả lời). Điều này giảm thiểu rủi ro AI bị nhầm lẫn và tự ý tóm tắt lại thay vì trả lời câu hỏi.

### C. Ép Buộc Quy tắc (Constraints)
Tôi đã đặt ra 5 quy tắc cứng:
- **"Không lan man" / "Trọng tâm"**: Xử lý triệt để căn bệnh nói dài dòng của LLM.
- **"Dễ hiểu"**: Đảm bảo từ vựng ở mức độ phổ thông.
- **"Có ví dụ"**: Kích hoạt khả năng suy luận mở rộng của LLM, giúp người dùng hình dung rõ vấn đề thay vì chỉ nhận được lý thuyết khô khan. (Giải quyết yêu cầu "có ví dụ").
- **"Rõ ràng"**: Ép output format dưới dạng danh sách (bullet points) để dễ đọc trên giao diện người dùng.
- **"Trung thực (Anti-Hallucination)"**: Rất quan trọng trong ứng dụng giáo dục. Ngăn AI tự bịa kiến thức (hallucination) khi nội dung tóm tắt không chứa thông tin để trả lời.

### D. Truyền Data Động (Dynamic Variables)
- `\${summary}`: Cung cấp knowledge base cho RAG (Retrieval-Augmented Generation).
- `\${historyContext}`: Truyền lại bối cảnh cũ để người dùng có thể hỏi nối tiếp (VD: *"Ví dụ vừa rồi có nghĩa là gì?"*).
- `\${question}`: Nhiệm vụ cuối cùng để thực thi.
