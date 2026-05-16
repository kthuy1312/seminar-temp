# AI Study Assistant - Fullstack Microservices

Hệ thống ứng dụng AI hỗ trợ học tập (AI Study Assistant) được xây dựng dựa trên kiến trúc Microservices (NestJS) kết hợp với Frontend (Next.js) và cơ sở dữ liệu PostgreSQL.

---

## 1. Kiến trúc Hệ thống

- **Frontend**: Next.js (Port 3100)
- **API Gateway**: NestJS (Port 3000) - Điểm điều hướng tập trung và xử lý Proxy/CORS.
- **7 Microservices (NestJS)**:
  - Auth Service (3001) - Xác thực & cấp phát JWT.
  - Dashboard Service (3002) - Thống kê dữ liệu tổng hợp.
  - Document Service (3003) - Xử lý tải lên và phân tích tài liệu (PDF/Word).
  - Goal Service (3004) - Quản lý mục tiêu học tập.
  - Quiz Service (3005) - Sinh trắc nghiệm bằng AI.
  - Summary Service (3006) - Tóm tắt tài liệu bằng AI.
  - Tutor Service (3007) - Gia sư AI tương tác thời gian thực.

Tất cả các truy vấn từ Frontend đều đi qua API Gateway tại `http://localhost:3000/api/*`.

---

## 2. Hướng dẫn Cài đặt (Dành cho thành viên mới)

Nếu bạn vừa clone source code về, hãy làm theo các bước sau để chạy dự án:

### Bước 1: Yêu cầu môi trường
- Node.js (phiên bản 18 trở lên).
- PostgreSQL (đang chạy ở cổng mặc định 5432).

### Bước 2: Cấu hình `.env`
Bạn cần copy các file `.env` chứa API Key (Gemini) và mật khẩu PostgreSQL vào:
- `frontend/.env.local`
- `services/api-gateway/.env`
- Các thư mục `services/*/.env` còn lại.

### Bước 3: Cài đặt thư viện & Tạo Database tự động
Mở PowerShell tại thư mục gốc của dự án và chạy:
```powershell
# 1. Cài đặt toàn bộ node_modules cho Frontend và Backend
.\scripts\install-all.ps1

# 2. Tự động tạo cấu trúc Database trong PostgreSQL
.\scripts\setup-db.ps1
```

---

## 3. Khởi chạy Hệ thống

Để khởi chạy toàn bộ 8 services và Frontend cùng lúc, bạn chỉ cần gõ 1 lệnh duy nhất ở thư mục gốc:

```powershell
.\scripts\start-all-dev.ps1
```

Vui lòng chờ khoảng 30s để hệ thống biên dịch. Sau đó, truy cập:
👉 **http://localhost:3100**

*(Lưu ý: Mật khẩu đăng ký tài khoản bắt buộc phải có ít nhất 6 ký tự, 1 chữ hoa, 1 chữ thường và 1 chữ số. Ví dụ: `Test1234`)*

---

## 4. Các Scripts Hỗ trợ Khác

- `.\scripts\test-endpoints.ps1`: Chạy để kiểm tra xem tất cả các API Gateway và Microservices có đang hoạt động hay không.
- `.\scripts\clean-rebuild.ps1`: Nếu quá trình chạy gặp lỗi lạ (như xung đột bộ nhớ cache), script này sẽ tự động xóa các file build cũ (`dist`, `.next`) và biên dịch lại từ đầu.

---

## 5. Xử lý sự cố (Troubleshooting)

- **Lỗi 502 Bad Gateway**: Lỗi này xảy ra do API Gateway đang gọi tới một Microservice bị sập hoặc chưa khởi động xong. Hãy check log terminal của Microservice tương ứng.
- **Lỗi FATAL: database does not exist**: Bạn quên chạy `.\scripts\setup-db.ps1`.
- **Lỗi Port already in use**: Xảy ra khi bạn chạy dự án 2 lần. Mở Task Manager tắt các tiến trình Node.js hoặc dùng lệnh `taskkill`.
