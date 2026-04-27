Bạn là một senior frontend developer.
NHIỆM VỤ:
Xây dựng giao diện (UI) cho màn hình "Learning Roadmap" của hệ thống AI Study Assistant bằng:
- Next.js (App Router)
- TypeScript
- Tailwind CSS
MỤC ĐÍCH:
Hiển thị lộ trình học tập được sinh ra từ AI dựa trên mục tiêu của người dùng.
CHỨC NĂNG CHÍNH:
Hiển thị danh sách các ngày học (Day 1, Day 2, ...)
Mỗi ngày bao gồm:
- Môn học (Subject)
- Nội dung học (Topic)
- Thời gian học (Duration)
- Mức độ ưu tiên (High / Medium / Low)
- Trạng thái:
  - Todo
  - In Progress
  - Done
UI YÊU CẦU:
- Layout dạng danh sách dọc (vertical timeline hoặc list)
- Mỗi ngày là một card riêng biệt
- Card bao gồm:
  - Title: Day 1 / Day 2
  - Nội dung học
  - Badge priority (màu sắc khác nhau)
  - Status indicator
- Có thể scroll nếu danh sách dài
- Có nút:
  - "Mark as Done"
  - "Start"
- Highlight ngày hiện tại
TRẢI NGHIỆM NGƯỜI DÙNG (UX):
- Khi click "Start":
  → chuyển status sang "In Progress"
- Khi click "Mark as Done":
  → chuyển sang "Done"
  → update UI ngay (useState)
- Hiển thị progress tổng:
  - % hoàn thành (progress bar trên cùng)
DATA GIẢ LẬP (MOCK DATA):
- Tạo sẵn 5–7 ngày học
- Dữ liệu giả lập ví dụ:
Day 1:
- Subject: Math
- Topic: Algebra basics
- Duration: 2h
- Priority: High
STYLE:
- Tailwind CSS
- Card bo góc (rounded-xl)
- Shadow nhẹ
- Màu:
  - High: đỏ hoặc cam
  - Medium: vàng
  - Low: xanh lá
- Progress bar màu xanh dương
KẾT NỐI APP:
- Sử dụng layout AppShell
- Route:
  - app/roadmap/page.tsx
OUTPUT:
- Code đầy đủ cho:
  app/roadmap/page.tsx
- Có thể tách component nếu cần:
  - RoadmapCard
  - ProgressBar
- Code phải:
- chạy được ngay
- clean
-  có state (useState)
QUAN TRỌNG:
- Không cần backend
- Không gọi API
- Tập trung UI + logic giả lập
