# Hướng dẫn khởi chạy Project AI Study Assistant

Hệ thống này sử dụng kiến trúc Microservices. Để chạy toàn bộ project, bạn cần khởi chạy Database và tất cả các service (Backend + Frontend).

## 1. Yêu cầu hệ thống (Prerequisites)
- **Node.js**: Phiên bản 18 trở lên.
- **PostgreSQL**: Đang chạy tại `localhost:5432` (User: `postgres`, Pass: `123`).
- **Gemini API Key**: Đã được cấu hình sẵn trong các file `.env`.

## 2. Chuẩn bị Cơ sở dữ liệu (Database Setup)
Đảm bảo các database sau đã tồn tại trong PostgreSQL:
- `auth_db`, `document_db`, `dashboard_db`, `goal_db`, `quiz_db`, `summary_db`, `tutor_db`.

## 3. Cách khởi chạy nhanh (Khuyên dùng)

Sử dụng script PowerShell để mở đồng loạt các service:

1. Mở PowerShell tại thư mục gốc.
2. Chạy lệnh:
   ```powershell
   ./start-all-dev.ps1
   ```
3. Khởi chạy Frontend:
   ```powershell
   cd frontend
   npm run dev
   ```

## 4. Danh sách các Service và Port

| Service | Thư mục | Port |
| :--- | :--- | :--- |
| **API Gateway** | `services/api-gateway` | 3000 |
| **Auth Service** | `services/auth-service` | 3001 |
| **Document Service** | `services/document-service` | 3003 |
| **Summary Service** | `services/summary-service` | 3006 |
| **Quiz Service** | `services/quiz-service` | 3005 |
| **Tutor Service** | `services/tutor-service` | 3007 |
| **Goal Service** | `services/goal-service` | 3004 |
| **Dashboard Service** | `services/dashboard-service` | 3002 |
| **Frontend** | `frontend` | 3100 |

## 5. Lưu ý quan trọng
- **CORS & Proxy**: Tất cả request từ Frontend gọi qua Port 3000 (Gateway). Gateway sẽ điều hướng đến đúng service.
- **AI**: Các chức năng Summary, Quiz, Tutor đã kết nối trực tiếp với Gemini AI thật.
- **Dữ liệu**: Nếu gặp lỗi database, hãy chạy `npx prisma db push` trong thư mục của service đó.
