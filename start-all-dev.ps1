# ============================================================
# start-all-dev.ps1 - Khởi động toàn bộ hệ thống
# ============================================================
# Port mapping:
#   Frontend      : 3100
#   API Gateway   : 3000
#   auth-service  : 3001
#   dashboard-service: 3002
#   document-service : 3003
#   goal-service  : 3004
#   quiz-service  : 3005
#   summary-service  : 3006
#   tutor-service : 3007
# ============================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Start-Service($name, $path, $cmd) {
    Write-Host "▶ Starting $name..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$path'; $cmd" -WindowStyle Normal
    Start-Sleep -Milliseconds 500
}

# 1. Microservices (start in parallel)
Start-Service "auth-service"      "$root\services\auth-service"      "npm run start:dev"
Start-Service "dashboard-service" "$root\services\dashboard-service"  "npm run start:dev"
Start-Service "document-service"  "$root\services\document-service"   "npm run start:dev"
Start-Service "goal-service"      "$root\services\goal-service"       "npm run start:dev"
Start-Service "quiz-service"      "$root\services\quiz-service"       "npm run start:dev"
Start-Service "summary-service"   "$root\services\summary-service"    "npm run start:dev"
Start-Service "tutor-service"     "$root\services\tutor-service"      "npm run start:dev"

# 2. Wait for services to be ready
Write-Host ""
Write-Host "⏳ Waiting 15 seconds for services to compile..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 3. API Gateway (after services are up)
Start-Service "api-gateway"       "$root\services\api-gateway"        "npm run start:dev"

Start-Sleep -Seconds 8

# 4. Frontend
Start-Service "frontend"          "$root\frontend"                    "npm run dev"

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host "   Frontend  → http://localhost:3100"
Write-Host "   Gateway   → http://localhost:3000"
Write-Host ""
Write-Host "📋 Password requirements: min 6 chars, 1 uppercase, 1 lowercase, 1 number"
Write-Host "   Example: Test1234"
