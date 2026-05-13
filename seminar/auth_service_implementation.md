# Auth Service — Implementation Guide

## Folder Structure

```
services/auth-service/
├── src/
│   ├── main.ts                              # Entry point
│   ├── app.module.ts                        # Root module
│   ├── config/
│   │   └── configuration.ts                 # Env config loader
│   ├── entities/
│   │   ├── user.entity.ts                   # User entity
│   │   └── refresh-token.entity.ts          # RefreshToken entity
│   ├── auth/
│   │   ├── auth.module.ts                   # Auth module
│   │   ├── auth.controller.ts               # REST endpoints
│   │   ├── auth.service.ts                  # Business logic
│   │   ├── dto/
│   │   │   ├── index.ts                     # Barrel export
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── update-profile.dto.ts
│   │   ├── decorators/
│   │   │   └── get-user.decorator.ts        # @GetUser() decorator
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts            # JWT guard
│   │   └── strategies/
│   │       └── jwt.strategy.ts              # Passport JWT strategy
│   └── common/
│       ├── filters/
│       │   └── http-exception.filter.ts     # Global error handler
│       └── interceptors/
│           └── transform.interceptor.ts     # Response wrapper
├── package.json
├── tsconfig.json
├── nest-cli.json
├── Dockerfile
├── .dockerignore
├── .env
└── .env.example
```

---

## API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `POST` | `/api/auth/register` | ❌ | Đăng ký tài khoản |
| `POST` | `/api/auth/login` | ❌ | Đăng nhập |
| `POST` | `/api/auth/refresh` | ❌ | Refresh access token |
| `POST` | `/api/auth/logout` | ✅ JWT | Đăng xuất (revoke token) |
| `GET` | `/api/auth/profile` | ✅ JWT | Lấy thông tin profile |
| `PUT` | `/api/auth/profile` | ✅ JWT | Cập nhật profile |

---

## Request / Response Examples

### Register
```json
// POST /api/auth/register
// Request:
{
  "email": "student@example.com",
  "password": "Pass123",
  "fullName": "Nguyen Van A"
}

// Response (201):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid...",
      "email": "student@example.com",
      "fullName": "Nguyen Van A",
      "role": "student",
      "createdAt": "2026-04-21T..."
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "uuid...",
    "expiresIn": "15m"
  },
  "timestamp": "2026-04-21T..."
}
```

### Login
```json
// POST /api/auth/login
// Request:
{
  "email": "student@example.com",
  "password": "Pass123"
}

// Response (200): Giống response register
```

### Refresh Token
```json
// POST /api/auth/refresh
// Request:
{
  "refreshToken": "uuid-refresh-token..."
}

// Response (200): Trả về user + accessToken + refreshToken mới
```

### Profile
```json
// GET /api/auth/profile
// Header: Authorization: Bearer <accessToken>

// Response (200):
{
  "success": true,
  "data": {
    "id": "uuid...",
    "email": "student@example.com",
    "fullName": "Nguyen Van A",
    "role": "student"
  }
}
```

---

## Error Response Format

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Email hoặc mật khẩu không đúng",
  "timestamp": "2026-04-21T...",
  "path": "/api/auth/login"
}
```

---

## Key Design Decisions

| Quyết định | Lý do |
|-----------|-------|
| **Refresh token rotation** | Mỗi lần refresh → revoke token cũ + tạo mới → chống token bị đánh cắp |
| **Refresh token lưu DB** | Cho phép revoke, kiểm soát session, không phụ thuộc JWT verify |
| **Password hashing (bcrypt, salt 10)** | Industry standard, chống brute force |
| **@Exclude() trên password** | class-transformer tự loại password khỏi mọi response |
| **Global ValidationPipe (whitelist + forbidNonWhitelisted)** | Chặn field lạ, chỉ nhận đúng DTO |
| **Global HttpExceptionFilter** | Chuẩn hóa error format cho toàn bộ API |
| **Global TransformInterceptor** | Mọi response đều có format `{ success, data, timestamp }` |

---

## Chạy thử

```bash
# 1. Cài dependencies
cd services/auth-service
npm install

# 2. Tạo database PostgreSQL
psql -U postgres -c "CREATE DATABASE auth_db;"

# 3. Cấu hình .env (đã tạo sẵn với giá trị mặc định)

# 4. Chạy development
npm run start:dev
```

> [!NOTE]
> `synchronize: true` trong TypeORM sẽ tự tạo bảng `users` và `refresh_tokens` khi chạy dev. **Không dùng trong production** — hãy dùng migration.
