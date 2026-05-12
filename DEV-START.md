# Local Development Startup Guide

## Quick Start (tất cả services)

```bash
# 1. Cài dependencies (nếu chưa cài)
.\install-all.ps1

# 2. Chạy tất cả services + frontend
.\start-all-dev.ps1
```

## Individual Service Startup

### 1. Auth Service (Port 3001)
```bash
cd services/auth-service
npm run start:dev
```

### 2. Dashboard Service (Port 3002)
```bash
cd services/dashboard-service
npm run start:dev
```

### 3. Document Service (Port 3003)
```bash
cd services/document-service
npm run start:dev
```

### 4. Goal Service (Port 3004)
```bash
cd services/goal-service
npm run start:dev
```

### 5. Quiz Service (Port 3005)
```bash
cd services/quiz-service
npm run start:dev
```

### 6. Summary Service (Port 3006)
```bash
cd services/summary-service
npm run start:dev
```

### 7. Tutor Service (Port 3007)
```bash
cd services/tutor-service
npm run start:dev
```

### 8. API Gateway (Port 3000) - IMPORTANT: Start last!
```bash
cd services/api-gateway
npm run start:dev
```

### 9. Frontend (Port 3100)
```bash
cd frontend
npm run dev
```

## Startup Order

**IMPORTANT**: Thứ tự startup rất quan trọng!

1. **Services first**:
   - Auth Service (3001) - FIRST (required for other services)
   - Dashboard Service (3002)
   - Document Service (3003)
   - Goal Service (3004)
   - Quiz Service (3005)
   - Summary Service (3006)
   - Tutor Service (3007)

2. **API Gateway** (3000) - AFTER all services are ready
   - Waits for all downstream services

3. **Frontend** (3100) - LAST
   - Connects to API Gateway

## Environment Configuration

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### API Gateway (.env)
```
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
DOCUMENT_SERVICE_URL=http://localhost:3003
SUMMARY_SERVICE_URL=http://localhost:3006
QUIZ_SERVICE_URL=http://localhost:3005
TUTOR_SERVICE_URL=http://localhost:3007
GOAL_SERVICE_URL=http://localhost:3004
DASHBOARD_SERVICE_URL=http://localhost:3002
```

### Services (.env)
Each service has its own port and database config. Check:
- `services/*/. env`

## Troubleshooting

### "nest is not recognized"
- Ensure @nestjs/cli is in devDependencies
- Run: `npm install` in service folder
- Or: `npx nest start --watch`

### Port already in use
- Frontend should stay on `3100`
- API Gateway should stay on `3000`
- Services should stay on `3001..3007`

### Database connection error
- Ensure PostgreSQL is running
- Update DB config in `.env` files
- Run migrations if needed

### CORS errors
- Ensure frontend calls `http://localhost:3000/api/*`
- All services have CORS enabled

## Test Flow

1. Open frontend: http://localhost:3100
2. Test auth:
   - Register: POST http://localhost:3000/api/auth/register
   - Login: POST http://localhost:3000/api/auth/login
3. Test other endpoints via frontend UI

## Logs & Debugging

- API Gateway logs all proxied requests
- Each service logs to console
- Check .env for NODE_ENV=development (enables debug logs)

## Architecture

```
Frontend (3100)
    ↓
API Gateway (3000)
    ├→ Auth Service (3001)
    ├→ Dashboard Service (3002)
    ├→ Document Service (3003)
    ├→ Goal Service (3004)
    ├→ Quiz Service (3005)
    ├→ Summary Service (3006)
    └→ Tutor Service (3007)
```

All communication goes through API Gateway for:
- Request logging
- JWT validation
- Request/response transformation
- Service routing
