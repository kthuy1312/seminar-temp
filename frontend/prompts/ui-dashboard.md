Bạn là một senior frontend developer.

NHIỆM VỤ:
Xây dựng giao diện (UI) cho màn hình "Dashboard" của hệ thống AI Study Assistant bằng:
- Next.js (App Router)
- TypeScript
- Tailwind CSS

MỤC ĐÍCH:
Hiển thị tổng quan tiến độ học tập, lộ trình học và các gợi ý từ AI cho người dùng.

CHỨC NĂNG CHÍNH:

Dashboard cần hiển thị:

1. Progress tổng
- % hoàn thành lộ trình học
- Progress bar

2. Next tasks (việc cần làm tiếp)
- Lấy từ roadmap (mock data)
- Hiển thị 2–3 task gần nhất

3. AI Suggestions
- Gợi ý học tập từ AI (mock)
- Ví dụ:
  - "You should review Algebra basics today"
  - "Focus more on Physics this week"

4. Quick actions
- Button:
  - "Upload Material"
  - "Ask AI Tutor"
  - "Start Quiz"

5. Study stats
- Số giờ học (mock)
- Số task đã hoàn thành
- Streak (số ngày học liên tiếp)

UI YÊU CẦU:

- Layout dạng grid (dashboard style)
- Chia thành nhiều card:

  - Card Progress
  - Card Next Tasks
  - Card AI Suggestions
  - Card Stats

- Card bo góc (rounded-xl)
- Shadow nhẹ
- Khoảng cách rõ ràng

- Responsive:
  - Desktop: nhiều cột
  - Mobile: 1 cột

TRẢI NGHIỆM NGƯỜI DÙNG (UX):

- Card rõ ràng, dễ đọc
- Có CTA (button) trong mỗi card
- Có thể click vào:
  - Task → chuyển sang /roadmap
  - Ask AI → /tutor

DATA GIẢ LẬP:

Mock data ví dụ:

- Progress: 40%
- Tasks:
  - Math: Algebra basics
  - Physics: Motion

- Stats:
  - 10 hours studied
  - 5 tasks completed
  - 3-day streak


STYLE:

- Tailwind CSS
- Màu chủ đạo: xanh dương
- Progress bar rõ ràng
- Typography dễ đọc

KẾT NỐI APP:
- Route:
  app/dashboard/page.tsx
- Sử dụng AppShell layout
OUTPUT:
- Code đầy đủ cho:
  app/dashboard/page.tsx
- Có thể tách component:
  - DashboardCard
  - ProgressBar
- Code phải:
  ✔ chạy được
  ✔ clean
  ✔ có mock data
QUAN TRỌNG:

- Không cần backend
- Không cần API
- Tập trung UI + hiển thị dữ liệu