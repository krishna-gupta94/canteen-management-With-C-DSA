@echo off
echo Building Canteen Backend...

if not exist obj mkdir obj

echo Building Server...
gcc -Wall -Wextra -Iinclude -g -DDEBUG src\*.c src\dsa\*.c -o canteen_server.exe -lws2_32 -lbcrypt

if %errorlevel% neq 0 (
    echo Server Build failed.
    exit /b %errorlevel%
)

echo Building Tests...
gcc -Wall -Wextra -Iinclude -g -DDEBUG tests\test_storage.c src\storage.c src\config.c -o test_storage.exe

if %errorlevel% neq 0 (
    echo Storage Test build failed.
    exit /b %errorlevel%
)

echo Building DSA Tests...
gcc -Wall -Wextra -Iinclude -g -DDEBUG tests\test_dsa.c src\dsa\linked_list.c src\dsa\queue.c src\dsa\stack.c src\dsa\priority_queue.c src\dsa\search.c src\dsa\sort.c -o test_dsa.exe

if %errorlevel% neq 0 (
    echo DSA Test build failed.
    exit /b %errorlevel%
)

echo Build successful! 
echo Run canteen_server.exe to start the server.
echo Run test_storage.exe to run storage tests.
echo Run test_dsa.exe to run DSA tests.
