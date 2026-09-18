# AI Work Scheduler - PowerShell 1-Click Launch Suite
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "                 AI WORK SCHEDULER - 1-CLICK LAUNCHER" -ForegroundColor Cyan
Write-Host "    Autonomous Workforce Scheduling, Allocation, Monitoring & Escalation" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "[1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Vite Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\frontend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host " SYSTEM READY!" -ForegroundColor Green
Write-Host " Frontend: http://localhost:5173" -ForegroundColor White
Write-Host " Backend:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host " Demo Logins:" -ForegroundColor Yellow
Write-Host "  - IT Company CEO:  alex.ceo / password123 (ORG-TECH)" -ForegroundColor White
Write-Host "  - Hospital Lead:   dr.reynolds / password123 (ORG-HOSP)" -ForegroundColor White
Write-Host "  - College Dean:    prof.sharma / password123 (ORG-COLL)" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Green

Start-Process "http://localhost:5173"
