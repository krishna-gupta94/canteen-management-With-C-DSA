@echo off
echo Building Canteen Backend...

if not exist obj mkdir obj

echo Building Server...
C:\Users\acer\AppData\Local\Microsoft\WinGet\Packages\BrechtSanders.WinLibs.POSIX.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\mingw64\bin\gcc.exe -Wall -Wextra -Iinclude -g -DDEBUG src\*.c src\dsa\*.c -o canteen_server.exe -lws2_32 -lbcrypt

if %errorlevel% neq 0 (
    echo Server Build failed.
    exit /b %errorlevel%
)

echo Building Seed Program...
C:\Users\acer\AppData\Local\Microsoft\WinGet\Packages\BrechtSanders.WinLibs.POSIX.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\mingw64\bin\gcc.exe -Wall -Wextra -Iinclude -g -DDEBUG tools\seed_demo.c src\storage.c src\auth_crypto.c src\config.c src\dsa\*.c -o seed_demo.exe -lbcrypt

if %errorlevel% neq 0 (
    echo Seed Program build failed.
    exit /b %errorlevel%
)

echo Building Tests...
C:\Users\acer\AppData\Local\Microsoft\WinGet\Packages\BrechtSanders.WinLibs.POSIX.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\mingw64\bin\gcc.exe -Wall -Wextra -Iinclude -g -DDEBUG tests\test_storage.c src\storage.c src\config.c -o test_storage.exe

if %errorlevel% neq 0 (
    echo Storage Test build failed.
    exit /b %errorlevel%
)

echo Building DSA Tests...
C:\Users\acer\AppData\Local\Microsoft\WinGet\Packages\BrechtSanders.WinLibs.POSIX.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\mingw64\bin\gcc.exe -Wall -Wextra -Iinclude -g -DDEBUG tests\test_dsa.c src\dsa\*.c -o test_dsa.exe

if %errorlevel% neq 0 (
    echo DSA Test build failed.
    exit /b %errorlevel%
)

echo Build successful! 
echo Run canteen_server.exe to start the server.
echo Run seed_demo.exe to seed demo data.
