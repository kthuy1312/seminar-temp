#!/usr/bin/env pwsh

$services = @(
    "services/api-gateway",
    "services/auth-service",
    "services/dashboard-service",
    "services/document-service",
    "services/goal-service",
    "services/quiz-service",
    "services/summary-service",
    "services/tutor-service"
)

$root = (Get-Item $MyInvocation.MyCommand.Path).Directory.Parent.FullName

Write-Host "🧹 Starting deep cleanup and rebuild..." -ForegroundColor Cyan

foreach ($service in $services) {
    $path = Join-Path $root $service
    Write-Host "Processing $service..." -ForegroundColor Yellow
    
    # 1. Clean dist and build info (legacy root cache + dist/.tsbuildinfo)
    $distPath = Join-Path $path "dist"
    $buildInfoPath = Join-Path $path "tsconfig.tsbuildinfo"
    $distBuildInfoPath = Join-Path $path "dist\.tsbuildinfo"
    
    if (Test-Path $distPath) {
        Remove-Item -Recurse -Force $distPath
        Write-Host "  - Removed dist" -ForegroundColor Gray
    }
    if (Test-Path $buildInfoPath) {
        Remove-Item -Force $buildInfoPath
        Write-Host "  - Removed tsconfig.tsbuildinfo" -ForegroundColor Gray
    }
    if (Test-Path $distBuildInfoPath) {
        Remove-Item -Force $distBuildInfoPath
        Write-Host "  - Removed dist/.tsbuildinfo" -ForegroundColor Gray
    }
    
    # 2. Build
    Set-Location $path
    Write-Host "  - Building..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed for $service" -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host "✅ $service rebuilt" -ForegroundColor Green
}

Write-Host "`n✨ Cleanup and rebuild complete!" -ForegroundColor Green
