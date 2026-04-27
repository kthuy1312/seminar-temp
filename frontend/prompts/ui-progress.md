Bạn là một senior frontend developer.

NHIỆM VỤ:
Xây dựng giao diện (UI) cho màn hình "Progress Tracking" của hệ thống AI Study Assistant bằng:
- Next.js (App Router)
- TypeScript
- Tailwind CSS

MỤC ĐÍCH:
Hiển thị tiến độ học tập của người dùng theo thời gian dưới dạng biểu đồ và thống kê.

CHỨC NĂNG CHÍNH:

1. Biểu đồ thời gian học
- Hiển thị số giờ học theo ngày hoặc tuần
- Dạng biểu đồ cột (bar chart)

2. Completion rate
- % hoàn thành lộ trình học
- Progress bar

3. Streak
- Số ngày học liên tiếp
- Ví dụ: "5-day streak 🔥"

4. Tổng quan:
- Tổng số giờ học
- Tổng số task đã hoàn thành

UI YÊU CẦU:

- Layout dạng dashboard (grid)
- Chia thành các card:

  - Card Chart (biểu đồ)
  - Card Completion
  - Card Stats (hours, tasks, streak)

- Card:
  - bo góc (rounded-xl)
  - shadow nhẹ
  - padding rõ ràng

BIỂU ĐỒ:

- Dùng thư viện:
  - recharts (khuyến nghị)

- Biểu đồ:
  - Bar chart
  - X-axis: ngày (Mon, Tue, Wed...)
  - Y-axis: số giờ học

TRẢI NGHIỆM NGƯỜI DÙNG (UX):

- Hover vào cột → hiển thị tooltip
- Responsive:
  - Desktop: full chart
  - Mobile: scroll ngang nếu cần

DATA GIẢ LẬP:

Mock data:

[
  { day: "Mon", hours: 2 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 1 },
  { day: "Thu", hours: 4 },
  { day: "Fri", hours: 2 },
]

- Completion: 60%
- Streak: 4 days
- Tasks done: 8

STYLE:

- Tailwind CSS
- Màu:
  - Chart: xanh dương
  - Progress bar: xanh
- Typography rõ ràng

KẾT NỐI APP:

- Route:
  app/progress/page.tsx

- Sử dụng AppShell

OUTPUT:
- Code đầy đủ cho:
  app/progress/page.tsx

- Có thể tách component:
  - ChartCard
  - StatsCard

- Code phải:
  ✔ chạy được
  ✔ có chart
  ✔ clean
QUAN TRỌNG:
- Không cần backend
- Không cần API
- Tập trung UI + visualization