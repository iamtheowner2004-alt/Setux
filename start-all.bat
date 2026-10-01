@echo off
title SetuX Platform Launcher
echo ============================================
echo       SETUX PLATFORM - STARTING ALL SERVICES
echo ============================================
echo.

echo [1/3] Starting FastAPI AI Engine on port 8000...
start "SetuX AI Engine (Port 8000)" cmd /k "cd /d "%~dp0AI-" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo [2/3] Starting Node.js Backend on port 5000...
start "SetuX Node Backend (Port 5000)" cmd /k "cd /d "%~dp0SetuX\backend" && node server.js"

timeout /t 3 /nobreak > nul

echo [3/3] Starting React Frontend on port 5173...
start "SetuX React Frontend (Port 5173)" cmd /k "cd /d "%~dp0SetuX\frontend\setux-frontend" && npm run dev"

timeout /t 5 /nobreak > nul

echo.
echo ============================================
echo  ALL SERVICES STARTED!
echo ============================================
echo.
echo   Homepage:          http://localhost:5173/
echo   Citizen Login:     http://localhost:5173/login
echo   Admin Login:       http://localhost:5173/admin/login
echo   Admin Username:    csmuadmin
echo   Admin Password:    admin1234
echo   AI API Docs:       http://localhost:8000/docs
echo.
echo  Opening browser...
start http://localhost:5173/
echo.
pause
