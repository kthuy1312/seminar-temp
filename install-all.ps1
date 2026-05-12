#!/usr/bin/env pwsh

$services = @(
    "frontend",
    "services/api-gateway",
    "services/auth-service",
    "services/dashboard-service",
    "services/document-service",
    "services/goal-service",
    "services/quiz-service",
    "services/summary-service",
    "services/tutor-service"
)

$root = "d:\Documents\Seminar\seminar-temp"

foreach ($service in $services) {
    $path = Join-Path $root $service
    Write-Host "Installing dependencies for $service..." -ForegroundColor Green
    Set-Location $path
    npm install --legacy-peer-deps 2>&1 | Out-Null
    Write-Host "✓ $service installed" -ForegroundColor Green
}

Write-Host "All dependencies installed!" -ForegroundColor Green
