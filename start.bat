@echo off
title AI Work Scheduler - Hackathon Launch Suite
color 0B

echo ==============================================================================
echo                 AI WORK SCHEDULER - 1-CLICK LAUNCHER
echo    Autonomous Workforce Scheduling, Allocation, Monitoring & Escalation
echo ==============================================================================
echo.

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo [1/3] Checking dependencies and database...
if not exist "backend\scheduler.db" (
    echo Seeding fresh database with 3 demo organizations (IT, Hospital, College)...
)

echo.
echo [2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "AI Work Scheduler - Backend (FastAPI)" cmd /k "cd /d "%ROOT_DIR%backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Vite Frontend on http://localhost:5173 ...
start "AI Work Scheduler - Frontend (Vite)" cmd /k "cd /d "%ROOT_DIR%frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ==============================================================================
echo  SYSTEM READY!
echo  Frontend: http://localhost:5173
echo  Backend:  http://127.0.0.1:8000/docs
echo.
echo  Demo Credentials:
echo   - Tech CEO:   alex.ceo / password123 (ORG-TECH)
echo   - Hospital:   dr.reynolds / password123 (ORG-HOSP)
echo   - College:    prof.sharma / password123 (ORG-COLL)
echo ==============================================================================
echo.

start http://localhost:5173
pause
