# Goal Service API

AI Study Assistant - Goal Management Microservice

## 🎯 Tổng quan

Goal Service quản lý các mục tiêu học tập của học sinh, bao gồm:
- ✅ CRUD mục tiêu (Goal)
- ✅ Quản lý các bước đạt được (Milestones)
- ✅ Theo dõi tiến độ (Progress tracking)
- ✅ Auto-calculate progress từ milestones
- ✅ Filter, pagination, sorting

## 📋 Kiến trúc

```
goal-service/
├── src/
│   ├── goal/
│   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── create-goal.dto.ts
│   │   │   ├── update-goal.dto.ts
│   │   │   ├── goal-response.dto.ts
│   │   │   ├── goal-query.dto.ts
│   │   │   ├── create-milestone.dto.ts
│   │   │   ├── update-milestone.dto.ts
│   │   │   ├── milestone-response.dto.ts
│   │   │   └── index.ts
│   │   ├── goal.controller.ts   # HTTP handlers
│   │   ├── goal.service.ts      # Business logic
│   │   └── goal.module.ts       # Module definition
│   ├── prisma/
│   │   ├── prisma.service.ts    # Prisma client service
│   │   └── prisma.module.ts     # Prisma module
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/
│   │       └── logging.interceptor.ts
│   ├── app.controller.ts        # Health check
│   ├── app.service.ts
│   ├── app.module.ts            # Root module
│   └── main.ts                  # Entry point
├── prisma/
│   └── schema.prisma            # Database schema
├── test/
│   └── app.e2e-spec.ts         # E2E tests
├── .env.example                # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

### Goals Table
```sql
CREATE TABLE goals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    category    VARCHAR(50),
    status      VARCHAR(20) DEFAULT 'active',  -- active | completed | paused
    target_date DATE,
    progress    INT DEFAULT 0,                  -- 0-100
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Milestones Table
```sql
CREATE TABLE milestones (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id     UUID REFERENCES goals(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    is_done     BOOLEAN DEFAULT FALSE,
    due_date    DATE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Cài đặt & Chạy

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 12
- npm hoặc yarn

### Installation

```bash
# 1. Cài đặt dependencies
npm install

# 2. Setup environment variables
cp .env.example .env

# Edit .env với database URL của bạn
# DATABASE_URL="postgresql://user:password@localhost:5432/goal_db"
```

### Database Setup

```bash
# 1. Tạo migration từ schema
npm run migration:generate -- --name InitSchema

# 2. Chạy migration
npm run migration:run

# Or use Prisma
npx prisma migrate dev --name init
npx prisma generate
```

### Chạy Service

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Service sẽ chạy tại port 3002 (mặc định)
# Swagger docs: http://localhost:3002/docs
```

## 📚 API Endpoints

### Health Check
```
GET /health
Response: { status: 'ok', service: 'goal-service', ... }
```

### Goals

#### 1. Create Goal
```http
POST /api/goals
Header: x-user-id: <user-uuid>
Content-Type: application/json

{
  "title": "Master NestJS",
  "description": "Complete NestJS course",
  "category": "Backend",
  "target_date": "2026-12-31"
}

Response (201):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Master NestJS",
  "description": "Complete NestJS course",
  "category": "Backend",
  "status": "active",
  "progress": 0,
  "target_date": "2026-12-31T00:00:00.000Z",
  "milestones": [],
  "created_at": "2026-04-26T10:00:00.000Z",
  "updated_at": "2026-04-26T10:00:00.000Z"
}
```

#### 2. List Goals (with pagination & filters)
```http
GET /api/goals?page=1&limit=10&status=active&category=Backend&sort_by=created_at&sort_order=desc
Header: x-user-id: <user-uuid>

Response (200):
{
  "data": [
    { goal object... },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 3. Get Goal Details
```http
GET /api/goals/:id
Header: x-user-id: <user-uuid>

Response (200): { goal object with milestones... }
```

#### 4. Update Goal
```http
PUT /api/goals/:id
Header: x-user-id: <user-uuid>
Content-Type: application/json

{
  "progress": 50,
  "status": "active",
  "target_date": "2026-12-31"
}

Response (200): { updated goal object... }
```

#### 5. Delete Goal
```http
DELETE /api/goals/:id
Header: x-user-id: <user-uuid>

Response (200): { deleted goal object... }
```

### Milestones

#### 1. Add Milestone
```http
POST /api/goals/:goalId/milestones
Header: x-user-id: <user-uuid>
Content-Type: application/json

{
  "title": "Complete NestJS basics",
  "due_date": "2026-06-30"
}

Response (201): { milestone object... }
```

#### 2. Update Milestone
```http
PUT /api/goals/:goalId/milestones/:milestoneId
Header: x-user-id: <user-uuid>
Content-Type: application/json

{
  "is_done": true,
  "title": "Updated title",
  "due_date": "2026-07-15"
}

Response (200): { updated milestone object... }
Note: When is_done changes, goal progress is auto-recalculated
```

#### 3. Delete Milestone
```http
DELETE /api/goals/:goalId/milestones/:milestoneId
Header: x-user-id: <user-uuid>

Response (200): { success: true, message: "Milestone deleted successfully" }
Note: Goal progress is auto-recalculated after deletion
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
npm run test:watch
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e

# With watch mode
npm run test:e2e -- --watch
```

## 📝 Postman Collection

Import this Postman environment variables:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "goal_service_url": "http://localhost:3002",
  "base_url": "{{goal_service_url}}/api"
}
```

### Sample Requests

**1. Create Goal**
```
POST {{base_url}}/goals
Headers:
  - x-user-id: {{user_id}}
Body (JSON):
{
  "title": "Master NestJS",
  "description": "Learn advanced NestJS patterns",
  "category": "Backend",
  "target_date": "2026-12-31"
}
```

**2. List Goals**
```
GET {{base_url}}/goals?page=1&limit=10&status=active
Headers:
  - x-user-id: {{user_id}}
```

**3. Add Milestone**
```
POST {{base_url}}/goals/{{goal_id}}/milestones
Headers:
  - x-user-id: {{user_id}}
Body (JSON):
{
  "title": "Complete basics course",
  "due_date": "2026-06-30"
}
```

**4. Mark Milestone as Done**
```
PUT {{base_url}}/goals/{{goal_id}}/milestones/{{milestone_id}}
Headers:
  - x-user-id: {{user_id}}
Body (JSON):
{
  "is_done": true
}
```

## 🔑 Key Features

### 1. Auto-Progress Calculation
Khi milestone được đánh dấu hoàn thành, progress của goal tự động tính lại:
```
progress = (completed_milestones / total_milestones) * 100
```

### 2. Auto-Complete Goal
Khi progress đạt 100%, status tự động chuyển thành 'completed'

### 3. Authorization
Mỗi user chỉ có thể truy cập goals của chính mình (kiểm tra `user_id`)

### 4. Validation
- Title: 3-255 characters, required
- Category: 1-50 characters, optional
- Progress: 0-100 integer
- Status: enum ['active', 'completed', 'paused']
- Target date: ISO 8601 format (YYYY-MM-DD)

### 5. Pagination & Filtering
- Pagination: `page`, `limit` (default: page=1, limit=10)
- Filter: `status`, `category`
- Sort: `sort_by`, `sort_order` (asc/desc)

## 📊 Logging

Tất cả logs được record với mức độ khác nhau:
- `DEBUG`: Chi tiết low-level operations
- `LOG`: Standard operations (tạo, update, xóa)
- `WARN`: Warning events
- `ERROR`: Error events

Log format:
```
[TIMESTAMP] [LEVEL] [CONTEXT] Message
```

## 🛠️ Environment Variables

```env
# Server
PORT=3002
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/goal_db

# Logging
LOG_LEVEL=debug
```

## 🐛 Error Handling

API trả về consistent error format:
```json
{
  "statusCode": 400,
  "timestamp": "2026-04-26T10:00:00.000Z",
  "path": "/api/goals",
  "error": "Validation failed: ..."
}
```

### Common Errors
- `400 Bad Request`: Invalid input/validation failed
- `401 Unauthorized`: Missing x-user-id header
- `403 Forbidden`: Access denied (resource belongs to another user)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## 🔄 Workflow Example

```
1. User tạo goal
   POST /api/goals → Goal created (progress: 0%, status: active)

2. User thêm milestones
   POST /api/goals/{id}/milestones → Milestone 1
   POST /api/goals/{id}/milestones → Milestone 2
   POST /api/goals/{id}/milestones → Milestone 3

3. User đánh dấu milestone hoàn thành
   PUT /api/goals/{id}/milestones/{m1_id} {is_done: true}
   → Goal progress auto-update: 33% (1/3 done)

4. User hoàn thành các milestone còn lại
   PUT /api/goals/{id}/milestones/{m2_id} {is_done: true}
   → Goal progress: 67% (2/3 done)

   PUT /api/goals/{id}/milestones/{m3_id} {is_done: true}
   → Goal progress: 100%, status auto-change to 'completed'
```

## 📦 Built With

- **NestJS** 11.x - Framework
- **Prisma** 7.x - ORM
- **PostgreSQL** - Database
- **TypeScript** - Language
- **Jest** - Testing
- **Swagger** - API documentation

## 🎓 Best Practices Implemented

- ✅ SOLID principles
- ✅ Layered architecture (Controller → Service → Repository)
- ✅ DTO validation (class-validator)
- ✅ Global exception handling
- ✅ Logging throughout the application
- ✅ Type safety (TypeScript)
- ✅ Unit & E2E tests
- ✅ Database migrations
- ✅ Environment configuration
- ✅ API documentation (Swagger)

## 📞 Support

For issues or questions, please check:
- Swagger docs: `/docs`
- Test files: `/test`
- Example requests above

---

**Last Updated**: April 2026
**Version**: 1.0.0
