#!/usr/bin/env pwsh

# Script to start all services in development mode
# This opens each service in a new terminal window

$root = "d:\Documents\Seminar\seminar-temp"
$services = @(
    @{ name = "auth-service"; path = "services/auth-service"; port = "3001" },
    @{ name = "dashboard-service"; path = "services/dashboard-service"; port = "3002" },
    @{ name = "document-service"; path = "services/document-service"; port = "3003" },
    @{ name = "goal-service"; path = "services/goal-service"; port = "3004" },
    @{ name = "quiz-service"; path = "services/quiz-service"; port = "3005" },
    @{ name = "summary-service"; path = "services/summary-service"; port = "3006" },
    @{ name = "tutor-service"; path = "services/tutor-service"; port = "3007" }
)

Write-Host "🚀 Starting all services in development mode..." -ForegroundColor Green
Write-Host "Each service will open in a new terminal window" -ForegroundColor Yellow
Write-Host ""

# Start each service in a new terminal
foreach ($service in $services) {
    $servicePath = Join-Path $root $service.path
    $serviceName = $service.name
    $port = $service.port
    
    Write-Host "Starting $serviceName on port $port..." -ForegroundColor Cyan
    
    # Open new PowerShell window and run npm start:dev
    $startScript = @"
Set-Location '$servicePath'
Write-Host '🔧 $serviceName starting on port $port...' -ForegroundColor Cyan
npm run start:dev
"@
    
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $startScript -WindowStyle Normal
    Start-Sleep -Milliseconds 500
}

# Start API Gateway
Write-Host "Starting API Gateway on port 3000..." -ForegroundColor Green
$apiGatewayScript = @"
Set-Location '$root\services\api-gateway'
Write-Host '🌐 API Gateway starting on port 3000...' -ForegroundColor Green
npm run start:dev
"@
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $apiGatewayScript -WindowStyle Normal
Start-Sleep -Milliseconds 500

# Start Frontend
Write-Host "Starting Frontend on port 3100..." -ForegroundColor Magenta
$frontendScript = @"
Set-Location '$root\frontend'
Write-Host '⚡ Frontend starting on port 3100...' -ForegroundColor Magenta
npm run dev
"@
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3100" -ForegroundColor Yellow
Write-Host "🌐 API Gateway: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Close terminal windows to stop services" -ForegroundColor Yellow
