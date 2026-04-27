Bạn là một senior frontend developer.

NHIỆM VỤ:
Xây dựng giao diện (UI) cho màn hình "AI Tutor" của hệ thống AI Study Assistant bằng:
- Next.js (App Router)
- TypeScript
- Tailwind CSS
MỤC ĐÍCH:
Cho phép người dùng hỏi đáp với AI dựa trên tài liệu đã học, giống như một gia sư cá nhân.
CHỨC NĂNG CHÍNH:
- Người dùng nhập câu hỏi
- Hiển thị câu trả lời từ AI
- Giao diện dạng chat (giống ChatGPT)
UI YÊU CẦU:
LAYOUT:
- Chia 2 phần:
1. Chat area (bên trái - chiếm phần lớn)
2. Context panel (bên phải - nhỏ hơn)
CHAT AREA:
- Danh sách tin nhắn (scrollable)
- Tin nhắn gồm:
  - User message (bên phải)
  - AI message (bên trái)
- Phân biệt bằng:
  - màu nền khác nhau
  - avatar (U / AI)
- Input box phía dưới:
  - text input
  - nút Send
CONTEXT PANEL:
Hiển thị:
- Tài liệu liên quan (mock)
- Chủ đề đang học (mock)
- Gợi ý câu hỏi nhanh:
  - "Giải thích dễ hơn"
  - "Cho ví dụ"
  - "Tạo câu hỏi ôn tập"

TRẢI NGHIỆM NGƯỜI DÙNG (UX):
- Khi user gửi câu hỏi:
  → thêm message vào chat
  → hiển thị loading (AI đang trả lời...)
- Sau 1–2 giây:
  → hiển thị câu trả lời giả lập từ AI
- Auto scroll xuống tin nhắn mới
DATA GIẢ LẬP:
- Tin nhắn ban đầu:
  AI: "Hi! I'm your AI tutor. Ask me anything."
- Khi user gửi:
  → trả về câu trả lời mock:
    "Here is a simple explanation for your question..."
STYLE:
- Tailwind CSS
- Chat bubble:
  - bo góc (rounded-xl)
  - padding thoải mái
- User:
  - màu xanh
- AI:
  - màu xám nhẹ
- Layout clean, giống ChatGPT
KẾT NỐI APP:
- Route:
  app/tutor/page.tsx
- Sử dụng layout AppShell
OUTPUT:
- Code đầy đủ cho:
  app/tutor/page.tsx
- Có thể tách component:
  - ChatMessage
  - ChatInput
- Code phải:
  ✔ chạy được ngay
  ✔ có state (useState)
  ✔ có scroll
  ✔ clean

QUAN TRỌNG:
- Không cần gọi API thật
- Không cần backend
- Tập trung UI + trải nghiệm chat
