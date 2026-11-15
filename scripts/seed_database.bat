@echo off
echo ===================================================
echo Seeding Canteen Management System Demo Data
echo ===================================================
cd /d "%~dp0..\backend"
if not exist seed_demo.exe (
    echo [INFO] Compiling seed_demo.c...
    gcc -Iinclude tools/seed_demo.c src/storage.c src/auth_crypto.c -o seed_demo.exe
)
echo [INFO] Running seed_demo.exe...
seed_demo.exe
echo [SUCCESS] Seeding complete.
pause
