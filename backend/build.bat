@echo off
echo Building Canteen Backend...

if not exist obj mkdir obj

gcc -Wall -Wextra -Iinclude -g -DDEBUG src\*.c -o canteen_server.exe -lws2_32

if %errorlevel% neq 0 (
    echo Build failed.
    exit /b %errorlevel%
)

echo Build successful! Run canteen_server.exe to start.
