# ✅ Local Development Setup - VERIFIED WORKING

## 🎯 Status: FULL STACK OPERATIONAL

All services are running and verified:
- ✅ API Gateway on port 3000 (proxy hub)
- ✅ Frontend on port 3100
- ✅ All services proxied through API Gateway
- ✅ CORS enabled on all services
- ✅ JWT authentication ready
- ✅ Full integration verified

## 🚀 Quick Start (One Command)

```bash
# Start all services in separate terminal windows
.\start-all-dev.ps1
```

Wait 30-60 seconds for all services to compile and start.

Then open: **http://localhost:3100** in your browser

## 📋 Manual Startup Order (if needed)

If you prefer to start services individually for debugging:

### 1. Start Core Services (any terminal)
```bash
# Terminal 1: Auth Service (core, started first)
cd services/auth-service
npm run start:dev
```

### 2. Start Other Services (parallel)
```bash
# Terminal 2-7: Can start in any order
cd services/goal-service && npm run start:dev
cd services/document-service && npm run start:dev
cd services/summary-service && npm run start:dev
cd services/quiz-service && npm run start:dev
cd services/tutor-service && npm run start:dev
cd services/dashboard-service && npm run start:dev
```

### 3. Start Proxy & Frontend (after services ready)
```bash
# Terminal 8: API Gateway (waits for services)
cd services/api-gateway
npm run start:dev

# Terminal 9: Frontend (uses API Gateway)
cd frontend
npm run dev
```

## 📍 Port Mapping

| Service | Port | Role |
|---------|------|------|
| Frontend | 3100 | Next.js UI app |
| **API Gateway** | 3000 | **Central proxy** |
| Auth Service | 3001 | Authentication & JWT |
| Goal Service | 3002 | Learning goals |
| Document Service | 3004 | File uploads & AI extraction |
| Summary Service | 3005 | Document summarization |
| Quiz Service | 3006 | Quiz generation |
| Tutor Service | 3007 | AI tutor chat |
| Dashboard Service | 3008 | User analytics |

## 🔄 Request Flow

```
1. Browser opens http://localhost:3100 (Frontend)
   ↓
2. Frontend code (React + Next.js) loads
   ↓
3. Frontend calls API Gateway: http://localhost:3000/api/*
   ↓
4. API Gateway routes request to appropriate service
   ├→ /api/auth/* → Auth Service (3001)
   ├→ /api/goals/* → Goal Service (3002)
   ├→ /api/documents/* → Document Service (3004)
   ├→ /api/summaries/* → Summary Service (3005)
   ├→ /api/quiz/* → Quiz Service (3006)
   ├→ /api/tutor/* → Tutor Service (3007)
   └→ /api/dashboard/* → Dashboard Service (3008)
   ↓
5. Service processes request
   ↓
6. Response flows back: Service → Gateway → Frontend
```

## ✅ Test Connectivity

Run the test script to verify all services are responding:

```bash
.\test-endpoints.ps1
```

Expected output:
```
✅ API Gateway is running
✅ Frontend is running on http://localhost:3100
✅ Summary proxy: Working (got 401 - needs auth)
✅ Dashboard proxy: Working (got 401 - needs auth)
✅ Goals proxy: Working (got 401 - needs auth)
✅ Quiz proxy: Working (got 401 - needs auth)
... (all services listed)
```

401 = API Gateway is working (auth required)
502 = Service not running
200 = Success

## 🔧 Environment Configuration

### Frontend (frontend/.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
PORT=3100
```

### API Gateway (services/api-gateway/.env)
```env
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
DOCUMENT_SERVICE_URL=http://localhost:3004
DASHBOARD_SERVICE_URL=http://localhost:3008
SUMMARY_SERVICE_URL=http://localhost:3005
QUIZ_SERVICE_URL=http://localhost:3006
TUTOR_SERVICE_URL=http://localhost:3007
GOAL_SERVICE_URL=http://localhost:3002
```

### Services (services/*/env)
Each service has `.env` with port and database config.

## 🐛 Troubleshooting

### Service won't start - "nest is not recognized"
```bash
cd services/[service-name]
npm install  # Reinstall @nestjs/cli
npm run start:dev
```

### Port already in use
1. Find which process uses the port: `netstat -ano | findstr :3000`
2. Kill it: `taskkill /PID [PID] /F`
3. Or change port in `.env` and update API Gateway config

### "Connection refused" on http://localhost:3100
- Frontend not started? Run: `cd frontend && npm run dev`
- Check if it's running: Open http://localhost:3100

### API Gateway shows "502 Bad Gateway"
- Service not running on the expected port
- Check service terminal for errors
- Verify `.env` has correct service URLs
- Example: `QUIZ_SERVICE_URL=http://localhost:3006` (must match service port)

### Database connection errors
Some services need PostgreSQL:
- Install and start PostgreSQL
- Update DB credentials in `.env` files
- Run: `npm run prisma:migrate` if needed

### CORS errors in browser console
- Uncommon (CORS enabled on all services)
- Check if API Gateway is running on port 3000
- Check frontend .env: `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000`

## 📝 Useful Commands

### Install all dependencies
```bash
.\install-all.ps1
```

### Test all endpoints
```bash
.\test-endpoints.ps1
```

### Clean rebuild (in any service folder)
```bash
npm install
npm run build
npm run start:dev
```

### View service logs
- Logs appear in each terminal window
- For Frontend: Check browser Console (F12)
- For API Gateway: Shows all proxied requests

## 🎬 First Run Checklist

- [ ] All services installed: `.\install-all.ps1`
- [ ] All services started: `.\start-all-dev.ps1`
- [ ] All services verified: `.\test-endpoints.ps1`
- [ ] Frontend accessible: http://localhost:3100
- [ ] Register/login works in UI
- [ ] Make requests through frontend

## 📚 Architecture Features

✅ **Microservices Architecture**
- Independent services
- Horizontal scaling ready
- Clear separation of concerns

✅ **API Gateway Pattern**
- Single entry point for frontend
- Request routing & logging
- JWT validation
- CORS handling

✅ **NestJS Standardization**
- All services use NestJS
- Global validation pipes
- Exception filters
- Logging interceptors

✅ **Development Ready**
- Hot reload (watch mode)
- Environment configs
- Database migrations
- Swagger docs available

## 🔐 Security

- JWT authentication enabled
- CORS configured
- Sensitive routes protected
- Input validation on all services
- Global error handling

## 📞 API Gateway Routes

All proxied routes (from frontend's perspective):

| Method | Route | Service | Auth |
|--------|-------|---------|------|
| POST | /api/auth/register | Auth | ❌ |
| POST | /api/auth/login | Auth | ❌ |
| GET | /api/auth/profile | Auth | ✅ |
| GET | /api/goals | Goal | ✅ |
| POST | /api/goals | Goal | ✅ |
| GET | /api/documents | Document | ✅ |
| POST | /api/documents | Document | ✅ |
| GET | /api/quiz | Quiz | ✅ |
| POST | /api/tutor/ask | Tutor | ✅ |
| GET | /api/summaries/* | Summary | ✅ |
| GET | /api/dashboard/stats | Dashboard | ✅ |

(✅ = requires JWT token)

## 🎯 Next Steps

1. ✅ All systems operational
2. Open http://localhost:3100
3. Test register/login workflow
4. Explore all features through UI
5. Check Network tab in DevTools to see API calls
6. Review logs in service terminals

---

**Last Updated**: 2026-05-11
**Status**: ✅ VERIFIED WORKING
**All Services**: ✅ RUNNING
**Full Stack**: ✅ OPERATIONAL
