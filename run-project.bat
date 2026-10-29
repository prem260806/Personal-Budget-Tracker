@echo off
title Personal Budget Tracker Launcher
echo =================================================================
echo    Starting Personal Budget Tracker - Full Stack MERN App
echo =================================================================
echo.

echo [1/2] Starting Backend Server (Port 5000)...
start "Personal Budget Tracker Backend" cmd /k "cd backend && npm start"

echo [2/2] Starting Frontend Server (Port 5173)...
start "Personal Budget Tracker Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting 3 seconds for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening Personal Budget Tracker in your browser...
start http://localhost:5173

echo.
echo =================================================================
echo  All set! Running at http://localhost:5173
echo  Do not close the two opened command prompt windows.
echo =================================================================
echo.
pause
