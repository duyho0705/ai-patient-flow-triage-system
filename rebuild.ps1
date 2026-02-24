# Tự động dọn dẹp port 8080 và khởi động lại Backend
Write-Host "--- Dang don dep port 8080 ---" -ForegroundColor Cyan
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { 
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue 
    Write-Host "Da dung process id: $_" -ForegroundColor Yellow
}

Write-Host "--- Dang quet sach Maven Cache ---" -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
.\mvnw.cmd clean

Write-Host "--- Dang khoi dong Backend (profile=dev) ---" -ForegroundColor Green
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
