# Hướng Dẫn Chạy Auth Service

Bài hướng dẫn này sẽ giúp bạn khởi chạy **Auth Service** (NestJS + PostgreSQL) từ con số 0, cách chạy database migration và test các API bằng Postman.

---

## 1. Setup Project & Cài Đặt

Mở terminal và di chuyển vào thư mục của Auth Service:

```bash
cd services/auth-service

# Cài đặt toàn bộ thư viện
npm install
```

---

## 2. Cấu Hình Database (PostgreSQL)

Bạn cần có PostgreSQL chạy trên máy. 

**Bước 2.1: Tạo database**
Mở pgAdmin hoặc terminal PostgreSQL (`psql`) và chạy lệnh:
```sql
CREATE DATABASE auth_db;
```

**Bước 2.2: Kiểm tra cấu hình môi trường (.env)**
File `.env` đã được tạo sẵn trong project. Hãy đảm bảo thông tin đăng nhập PostgreSQL trùng khớp với máy bạn:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres    # Thay bằng password PostgreSQL của bạn
DB_NAME=auth_db

JWT_ACCESS_SECRET=your-access-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 3. Chạy Migration (Khởi tạo bảng)

Thay vì để TypeORM tự động tạo bảng (có thể nguy hiểm trên production), chúng ta sẽ dùng tính năng Migration. 
Tôi đã cấu hình sẵn file `src/config/data-source.ts`.

**Bước 3.1: Tạo file migration từ schema hiện tại**
```bash
npm run migration:generate -- src/migrations/InitSchema
```
*Lệnh này sẽ so sánh Entities (`User`, `RefreshToken`) với Database rỗng và tạo ra 1 file migration chứa các lệnh SQL cần thiết trong thư mục `src/migrations`.*

**Bước 3.2: Chạy migration để apply vào database**
```bash
npm run migration:run
```
*Bạn có thể mở pgAdmin lên để kiểm tra, sẽ thấy 2 bảng `users` và `refresh_tokens` đã được tạo.*

---

## 4. Chạy Server

Khởi động NestJS server ở chế độ watch (tự động reload khi có thay đổi code):

```bash
npm run start:dev
```

Terminal sẽ hiển thị:
```
[NestApplication] Nest application successfully started
🔐 Auth Service is running on http://localhost:3001
```

---

## 5. Test bằng Postman

Mở Postman và test theo thứ tự sau:

### 5.1. API Đăng Ký (Register)
- **Method**: `POST`
- **URL**: `http://localhost:3001/api/auth/register`
- **Body** (raw -> JSON):
```json
{
  "email": "test1@example.com",
  "password": "Password123",
  "fullName": "Nguyen Van A"
}
```
**Kết quả mong đợi:** Mã `201 Created` kèm thông tin user và `accessToken`, `refreshToken`.

### 5.2. API Đăng Nhập (Login)
- **Method**: `POST`
- **URL**: `http://localhost:3001/api/auth/login`
- **Body** (raw -> JSON):
```json
{
  "email": "test1@example.com",
  "password": "Password123"
}
```
**Kết quả mong đợi:** Mã `200 OK` kèm thông tin tokens. *(Hãy copy đoạn `accessToken` và `refreshToken` để dùng cho các bước sau).*

### 5.3. API Xem Profile (Cần Access Token)
- **Method**: `GET`
- **URL**: `http://localhost:3001/api/auth/profile`
- **Auth**: Chọn tab `Authorization` -> Type: `Bearer Token` -> Dán `accessToken` vào.
**Kết quả mong đợi:** Trả về thông tin profile của bạn. Mật khẩu (`password`) sẽ bị ẩn.

### 5.4. API Refresh Token
Khi `accessToken` hết hạn (sau 15 phút), bạn dùng API này để lấy token mới.
- **Method**: `POST`
- **URL**: `http://localhost:3001/api/auth/refresh`
- **Body** (raw -> JSON):
```json
{
  "refreshToken": "<Dán refreshToken lấy từ bước Login vào đây>"
}
```
**Kết quả mong đợi:** Trả về bộ token mới. Token cũ sẽ bị revoke (hủy bỏ) trong database.

### 5.5. API Cập Nhật Profile
- **Method**: `PUT`
- **URL**: `http://localhost:3001/api/auth/profile`
- **Auth**: Cung cấp `Bearer Token` (access token).
- **Body** (raw -> JSON):
```json
{
  "fullName": "Tên Đã Đổi",
  "avatarUrl": "https://example.com/avatar.png"
}
```

### 5.6. API Đăng Xuất (Logout)
- **Method**: `POST`
- **URL**: `http://localhost:3001/api/auth/logout`
- **Auth**: Cung cấp `Bearer Token`.
- **Body** (raw -> JSON):
```json
{
  "refreshToken": "<Dán refreshToken hiện tại>"
}
```
**Kết quả mong đợi:** Token bị đánh dấu `is_revoked = true` trong DB, bạn không thể dùng token đó để refresh nữa.
