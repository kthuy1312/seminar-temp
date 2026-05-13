# Goal Service - Quick Start Guide

## ⚡ 5 Phút Setup

### 1. Install Dependencies
```bash
cd services/goal-service
npm install
```

### 2. Setup Database
```bash
# Copy .env template
cp .env.example .env

# Edit .env - thay đổi DATABASE_URL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/goal_db"

# Run migrations
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Start Service
```bash
npm run start:dev
```

Service chạy tại: **http://localhost:3002**  
Swagger Docs: **http://localhost:3002/docs**

---

## 🧪 Test API with cURL

### Health Check
```bash
curl http://localhost:3002/health
```

### Create Goal
```bash
curl -X POST http://localhost:3002/api/goals \
  -H "Content-Type: application/json" \
  -H "x-user-id: 550e8400-e29b-41d4-a716-446655440001" \
  -d '{
    "title": "Learn NestJS",
    "description": "Master NestJS from basics to advanced",
    "category": "Backend",
    "target_date": "2026-12-31"
  }'
```

### List Goals
```bash
curl http://localhost:3002/api/goals \
  -H "x-user-id: 550e8400-e29b-41d4-a716-446655440001"
```

### Get Goal Details
```bash
curl http://localhost:3002/api/goals/{goal_id} \
  -H "x-user-id: 550e8400-e29b-41d4-a716-446655440001"
```

### Add Milestone
```bash
curl -X POST http://localhost:3002/api/goals/{goal_id}/milestones \
  -H "Content-Type: application/json" \
  -H "x-user-id: 550e8400-e29b-41d4-a716-446655440001" \
  -d '{
    "title": "Complete NestJS basics",
    "due_date": "2026-06-30"
  }'
```

### Mark Milestone Done
```bash
curl -X PUT http://localhost:3002/api/goals/{goal_id}/milestones/{milestone_id} \
  -H "Content-Type: application/json" \
  -H "x-user-id: 550e8400-e29b-41d4-a716-446655440001" \
  -d '{"is_done": true}'
```

---

## 🧪 Run Tests

```bash
# Unit tests
npm run test

# With coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

---

## 📱 Test with Postman

1. **Import Environment**
   - Variable: `user_id` = `550e8400-e29b-41d4-a716-446655440001`
   - Variable: `base_url` = `http://localhost:3002/api`
   - Variable: `goal_id` = (sẽ được set sau khi create goal)

2. **Requests**

**[1] POST - Create Goal**
```
URL: {{base_url}}/goals
Headers: x-user-id: {{user_id}}
Body:
{
  "title": "Master NestJS",
  "description": "Learn advanced patterns",
  "category": "Backend",
  "target_date": "2026-12-31"
}
```

**[2] GET - List Goals**
```
URL: {{base_url}}/goals?status=active&page=1&limit=10
Headers: x-user-id: {{user_id}}
```

**[3] GET - Goal Details**
```
URL: {{base_url}}/goals/{{goal_id}}
Headers: x-user-id: {{user_id}}
```

**[4] PUT - Update Goal Progress**
```
URL: {{base_url}}/goals/{{goal_id}}
Headers: x-user-id: {{user_id}}
Body:
{
  "progress": 50,
  "status": "active"
}
```

**[5] POST - Add Milestone**
```
URL: {{base_url}}/goals/{{goal_id}}/milestones
Headers: x-user-id: {{user_id}}
Body:
{
  "title": "Complete basics",
  "due_date": "2026-06-30"
}
```

**[6] PUT - Mark Milestone Done**
```
URL: {{base_url}}/goals/{{goal_id}}/milestones/{{milestone_id}}
Headers: x-user-id: {{user_id}}
Body:
{
  "is_done": true
}
```

**[7] DELETE - Remove Goal**
```
URL: {{base_url}}/goals/{{goal_id}}
Headers: x-user-id: {{user_id}}
Method: DELETE
```

---

## 🏗️ Service Architecture

```
┌─────────────────────────────────────────┐
│         API Gateway (Port 3000)         │
│        JWT Auth + Rate Limiting         │
└────────────────┬────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
┌────────────────┐   ┌──────────────────┐
│ Goal Service   │   │ Other Services   │
│  (Port 3002)   │   │  (3001-3008)     │
└────────────────┘   └──────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│    PostgreSQL Database          │
│  (goal_db)                      │
│  - goals table                  │
│  - milestones table             │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│    Message Broker (RabbitMQ)    │
│ Events:                         │
│  - goal.created                 │
│  - goal.completed               │
│  - goal.progress_updated        │
└─────────────────────────────────┘
```

---

## 📊 Database Schema

```sql
-- Goals Table
CREATE TABLE goals (
    id          UUID PRIMARY KEY,
    user_id     UUID NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    category    VARCHAR(50),
    status      VARCHAR(20) DEFAULT 'active',
    target_date DATE,
    progress    INT DEFAULT 0,  -- 0-100
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_goals_user_id ON goals(user_id);

-- Milestones Table
CREATE TABLE milestones (
    id          UUID PRIMARY KEY,
    goal_id     UUID REFERENCES goals(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    is_done     BOOLEAN DEFAULT FALSE,
    due_date    DATE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);
```

---

## 🔑 Key Features

### ✅ Auto-Progress Calculation
```
When milestone is marked done:
progress = (completed_milestones / total_milestones) * 100

Example:
- 3 milestones total
- 1 completed → progress = 33%
- 2 completed → progress = 67%
- 3 completed → progress = 100% + status auto-change to 'completed'
```

### ✅ Authorization
- User chỉ có thể access goals của chính mình
- API kiểm tra `user_id` từ header `x-user-id`

### ✅ Validation
- Title: 3-255 chars, required
- Progress: 0-100 integer
- Status: active | completed | paused
- Target date: ISO 8601 (YYYY-MM-DD)

### ✅ Pagination
```
GET /api/goals?page=1&limit=10

Response:
{
  "data": [...],
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

### ✅ Filtering & Sorting
```
GET /api/goals?status=active&category=Backend&sort_by=created_at&sort_order=desc
```

---

## 🐛 Troubleshooting

### Issue: Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Kiểm tra PostgreSQL running và DATABASE_URL chính xác

### Issue: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3002
```
**Solution**: Thay đổi PORT trong .env hoặc kill process trên port 3002

### Issue: Migration Failed
```
Error: Prisma migrations conflict
```
**Solution**: Xóa folder prisma/migrations và run `npx prisma migrate dev`

### Issue: Tests Fail
```
Error: ENOTFOUND localhost
```
**Solution**: Kiểm tra test database connection hoặc skip tests khi deploy

---

## 📈 Performance Tips

1. **Database Indexes** - Đã setup `user_id` và `goal_id` indexes
2. **Pagination** - Luôn dùng pagination cho list endpoints
3. **Caching** - Có thể thêm Redis caching cho goals list
4. **Logging** - DEBUG logs có thể disable trong production

---

## 🚀 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --prod
COPY dist ./dist
EXPOSE 3002
CMD ["npm", "run", "start:prod"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  goal-service:
    build: ./services/goal-service
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/goal_db
    depends_on:
      - postgres
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

---

## 📞 Resources

- **Swagger UI**: `/docs`
- **ReDoc**: `/docs-json`
- **GitHub**: [Link to repository]
- **Issues**: [GitHub Issues]

---

**Last Updated**: April 26, 2026
**Version**: 1.0.0
