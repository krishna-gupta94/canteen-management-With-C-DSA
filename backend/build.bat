@echo off
setlocal
echo ===================================================
echo Building Canteen Backend (C + DSA)
echo ===================================================

where gcc >nul 2>&1
if %errorlevel% equ 0 (
    set CC=gcc
) else (
    set CC=C:\Users\acer\AppData\Local\Microsoft\WinGet\Packages\BrechtSanders.WinLibs.POSIX.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\mingw64\bin\gcc.exe
)

if not exist obj mkdir obj

echo [1/4] Compiling Server (canteen_server.exe)...
%CC% -Wall -Wextra -Iinclude -O2 src\*.c src\dsa\*.c -o canteen_server.exe -lws2_32 -lbcrypt
if %errorlevel% neq 0 (
    echo [ERROR] Server build failed.
    exit /b %errorlevel%
)

echo [2/4] Compiling Seed Program (seed_demo.exe)...
%CC% -Wall -Wextra -Iinclude -O2 tools\seed_demo.c src\storage.c src\auth_crypto.c src\config.c src\dsa\*.c -o seed_demo.exe -lbcrypt
if %errorlevel% neq 0 (
    echo [ERROR] Seed program build failed.
    exit /b %errorlevel%
)

echo [3/4] Compiling Storage Unit Tests (test_storage.exe)...
%CC% -Wall -Wextra -Iinclude -O2 tests\test_storage.c src\storage.c src\config.c -o test_storage.exe
if %errorlevel% neq 0 (
    echo [ERROR] Storage test build failed.
    exit /b %errorlevel%
)

echo [4/4] Compiling DSA Unit Tests (test_dsa.exe)...
%CC% -Wall -Wextra -Iinclude -O2 tests\test_dsa.c src\dsa\*.c -o test_dsa.exe
if %errorlevel% neq 0 (
    echo [ERROR] DSA test build failed.
    exit /b %errorlevel%
)

echo ===================================================
echo Build successful!
echo - canteen_server.exe (HTTP Server)
echo - seed_demo.exe      (Data Seeder)
echo - test_storage.exe   (Storage Test Suite)
echo - test_dsa.exe       (DSA Test Suite)
echo ===================================================
