# Dashboard Service

Dashboard Service tong hop du lieu hoc tap tu cac service qua event va cung cap API thong ke cho frontend.

## Chuc nang chinh

- Nhan event tu RabbitMQ: `user.created`, `goal.created`, `goal.completed`, `document.uploaded`, `quiz.completed`, `roadmap.step_completed`, `summary.created`.
- Cap nhat bang tong hop `user_stats`.
- Luu nhat ky hoat dong vao `activity_log`.
- Luu metric quiz de tinh `avg_quiz_score` on dinh va idempotent.
- Cung cap REST API:
  - `GET /api/dashboard/stats`
  - `GET /api/dashboard/activity`
  - `GET /api/dashboard/progress`
- Swagger: `GET /api/docs`.

## Kien truc

- `DashboardController`: REST API.
- `DashboardEventsController`: RabbitMQ event handlers.
- `DashboardService`: business logic va transaction boundary.
- `PrismaModule`: ket noi PostgreSQL.

## Cau hinh moi truong

Copy `.env.example` thanh `.env`:

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/dashboard_db"
RABBITMQ_URL="amqp://localhost:5672"
ENABLE_RABBITMQ=true
DASHBOARD_QUEUE="dashboard_events_queue"
PORT=3008
```

## Chay service

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

## Test API nhanh bang Postman

### 1) Lay tong quan toan he thong
- Method: `GET`
- URL: `http://localhost:3008/api/dashboard/stats`

### 2) Lay thong ke theo user
- Method: `GET`
- URL: `http://localhost:3008/api/dashboard/stats?userId=<USER_UUID>`

### 3) Lay activity log
- Method: `GET`
- URL: `http://localhost:3008/api/dashboard/activity?userId=<USER_UUID>&limit=20&offset=0`

### 4) Lay progress timeline
- Method: `GET`
- URL: `http://localhost:3008/api/dashboard/progress?userId=<USER_UUID>&period=30d`

## Mau payload event de test RMQ

### user.created
```json
{
  "user_id": "e1fd5d9c-1373-49c7-9522-169af980f8dd",
  "occurred_at": "2026-04-24T09:00:00.000Z"
}
```

### quiz.completed
```json
{
  "user_id": "e1fd5d9c-1373-49c7-9522-169af980f8dd",
  "quiz_id": "f5c5683f-7c57-4c27-9db0-c6cd7d26f8f6",
  "score": 80.5,
  "occurred_at": "2026-04-24T10:00:00.000Z"
}
```
