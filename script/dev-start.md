# Dev Start

Frontend:
`cd frontend && npm run dev`

API Gateway:
`cd services/api-gateway && npm run start:dev`

Services:
`cd services/auth-service && npm run start:dev`
`cd services/dashboard-service && npm run start:dev`
`cd services/document-service && npm run start:dev`
`cd services/goal-service && npm run start:dev`
`cd services/quiz-service && npm run start:dev`
`cd services/summary-service && npm run start:dev`
`cd services/tutor-service && npm run start:dev`

Startup order:
1. `auth-service` on `3001`
2. `dashboard-service` on `3002`
3. `document-service` on `3003`
4. `goal-service` on `3004`
5. `quiz-service` on `3005`
6. `summary-service` on `3006`
7. `tutor-service` on `3007`
8. `api-gateway` on `3000`
9. `frontend` on `3100`

Base URLs:
- Frontend: `http://localhost:3100`
- API Gateway: `http://localhost:3000`
- Frontend API base: `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000`
