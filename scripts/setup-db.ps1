#!/usr/bin/env pwsh

$services = @(
    "services/auth-service",
    "services/dashboard-service",
    "services/document-service",
    "services/goal-service",
    "services/quiz-service",
    "services/summary-service",
    "services/tutor-service"
)

$root = (Get-Item $MyInvocation.MyCommand.Path).Directory.Parent.FullName

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " BẮT ĐẦU TẠO DATABASE VÀ SYNC SCHEMA" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

foreach ($service in $services) {
    $path = Join-Path $root $service
    $prismaPath = Join-Path $path "prisma\schema.prisma"
    
    if (Test-Path $prismaPath) {
        Write-Host "`nĐang xử lý $service..." -ForegroundColor Yellow
        Set-Location $path
        
        Write-Host "  -> Tạo DB & Push Schema..." -ForegroundColor DarkGray
        # Lệnh này sẽ tự động tạo Database nếu chưa có, và tạo các bảng (tables) dựa trên schema
        npx prisma db push
        
        Write-Host "  -> Generate Prisma Client..." -ForegroundColor DarkGray
        npx prisma generate
        
        Write-Host "✓ $service hoàn tất!" -ForegroundColor Green
    }
}

Set-Location $root
Write-Host "`n✅ ĐÃ TẠO XONG TOÀN BỘ DATABASE. BẠN CÓ THỂ CHẠY start-all-dev.ps1" -ForegroundColor Green
