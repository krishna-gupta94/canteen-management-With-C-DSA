@echo off
echo ===================================================
echo Starting Canteen Management System C Backend Server
echo ===================================================
cd /d "%~dp0..\backend"
if not exist canteen_server.exe (
    echo [INFO] Compiling canteen_server.exe...
    call build.bat
)
echo [INFO] Running canteen_server.exe on port 8080...
canteen_server.exe
pause
