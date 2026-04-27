Bạn là một senior frontend developer.
NHIỆM VỤ:
Xây dựng giao diện (UI) cho màn hình "Goal Setting" của hệ thống AI Study Assistant bằng:
- Next.js (App Router)
- TypeScript
- Tailwind CSS
MỤC ĐÍCH:
Cho phép người dùng nhập mục tiêu học tập để hệ thống sinh lộ trình học phù hợp.
CHỨC NĂNG CHÍNH:
Người dùng cần nhập:
1. Mục tiêu điểm số
   - Input text
   - Ví dụ: "Toán 8+", "Lý 7+"
2. Trình độ hiện tại
   - Dropdown (select)
   - Giá trị:
     - Beginner
     - Intermediate
     - Advanced
3. Thời gian học mỗi ngày
   - Input number
   - Đơn vị: giờ/ngày
4. Danh sách môn học
   - Multi-select (hoặc input dạng tag)
   - Ví dụ:
     - Math
     - Physics
     - Chemistry
5. Thời gian học (duration)
   - Dropdown:
     - 7 days
     - 1 month
     - 3 months
UI YÊU CẦU:
- Layout dạng card nằm giữa màn hình
- Form rõ ràng, dễ đọc
- Khoảng cách (padding, margin) hợp lý
- Label + input thẳng hàng
- Button lớn phía dưới: "Generate Study Plan"
- Có thể chia form thành 2 cột trên desktop
- Mobile hiển thị 1 cột
TRẢI NGHIỆM NGƯỜI DÙNG (UX):
- Validate cơ bản:
  - Không cho submit nếu thiếu thông tin
- Khi submit:
  - Hiển thị loading (UI)
  - Sau đó redirect sang "/roadmap" (giả lập)
STYLE:
- Tailwind CSS
- Bo góc (rounded-xl)
- Shadow nhẹ
- Màu chủ đạo: xanh dương nhẹ (blue-500)
- Button có hover effect
KẾT NỐI APP:
- Sử dụng layout có sẵn (AppShell)
- Import và dùng component:
  - PagePlaceholder nếu cần
- Route:
  - File đặt tại: app/goals/page.tsx
OUTPUT:
- Code đầy đủ cho:
  app/goals/page.tsx
- Code phải:
clean
chạy được ngay
dễ đọc
đúng Next.js App Router
QUAN TRỌNG:
- Không cần backend
- Không cần gọi API thật
- Chỉ cần UI + state cơ bản (useState)
- Tập trung vào trải nghiệm người dùng
