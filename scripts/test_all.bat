@echo off
echo ===================================================
echo Running Full Canteen Management Verification Suite
echo ===================================================
cd /d "%~dp0.."

echo.
echo [1/2] Verifying Frontend Production Build...
cd frontend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend build failed!
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [2/2] Running Backend Integration Tests...
powershell -ExecutionPolicy Bypass -File tests\integration_test.ps1

echo ===================================================
echo Verification suite completed.
echo ===================================================
