#!/usr/bin/env pwsh

# Test Full Stack Flow - Version 2
# Tests: Frontend → API Gateway → Services
# Improved: Better error handling and auth-free endpoint testing

$apiBase = "http://localhost:3000"
$frontendPort = "3100"

Write-Host "🧪 Testing Full Stack Flow" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

# Test 1: API Gateway connectivity
Write-Host "[1/4] Testing API Gateway connectivity..." -ForegroundColor Cyan
try {
    # Any proxied endpoint returns 401 if gateway is working but no auth
    $null = Invoke-WebRequest -Uri "$apiBase/api/goals" -Method GET -SkipHttpErrorCheck
    Write-Host "✅ API Gateway is running" -ForegroundColor Green
} catch {
    Write-Host "❌ API Gateway is NOT responding - connection failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try: cd services/api-gateway && npm run start:dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Frontend connectivity
Write-Host "[2/4] Testing Frontend connectivity..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$frontendPort" -SkipHttpErrorCheck
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running on http://localhost:$frontendPort" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend is responding but with status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend is NOT responding" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try: cd frontend && npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Service proxy paths
Write-Host "[3/4] Testing Service Proxy Paths..." -ForegroundColor Cyan
$services = @{
    "Auth" = "/api/auth/health";
    "Goals" = "/api/goals";
    "Quiz" = "/api/quiz";
    "Tutor" = "/api/tutor/ask";
    "Summary" = "/api/summaries/document/test-id";
    "Documents" = "/api/documents";
    "Dashboard" = "/api/dashboard/stats";
}

foreach ($service in $services.GetEnumerator()) {
    try {
        $response = Invoke-WebRequest -Uri "$apiBase$($service.Value)" -Method GET -SkipHttpErrorCheck
        if ($response.StatusCode -eq 401) {
            Write-Host "  ✅ $($service.Name) proxy: Working (got 401 - needs auth)" -ForegroundColor Green
        } elseif ($response.StatusCode -eq 404) {
            Write-Host "  ⚠️  $($service.Name) proxy: 404 - Service running but endpoint not found" -ForegroundColor Yellow
        } elseif ($response.StatusCode -eq 502) {
            Write-Host "  ❌ $($service.Name) proxy: 502 - Service not running" -ForegroundColor Red
        } else {
            Write-Host "  ✅ $($service.Name) proxy: Status $($response.StatusCode)" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ $($service.Name) proxy: Connection failed - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 4: Summary
Write-Host "[4/4] System Status Summary" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Service Ports:" -ForegroundColor Yellow
Write-Host "  • API Gateway:       http://localhost:3000 (proxy hub)" -ForegroundColor Cyan
Write-Host "  • Auth Service:      http://localhost:3001" -ForegroundColor Cyan
Write-Host "  • Goal Service:      http://localhost:3002" -ForegroundColor Cyan
Write-Host "  • Document Service:  http://localhost:3004" -ForegroundColor Cyan
Write-Host "  • Summary Service:   http://localhost:3005" -ForegroundColor Cyan
Write-Host "  • Quiz Service:      http://localhost:3006" -ForegroundColor Cyan
Write-Host "  • Tutor Service:     http://localhost:3007" -ForegroundColor Cyan
Write-Host "  • Dashboard Service: http://localhost:3008" -ForegroundColor Cyan
Write-Host "  • Frontend:          http://localhost:$frontendPort" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Frontend Flow:" -ForegroundColor Magenta
Write-Host "  1. Open http://localhost:$frontendPort in browser" -ForegroundColor Cyan
Write-Host "  2. Frontend calls http://localhost:3000/api/* (API Gateway)" -ForegroundColor Cyan
Write-Host "  3. API Gateway forwards to services" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Testing complete!" -ForegroundColor Green
