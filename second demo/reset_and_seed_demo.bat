@echo off
echo Resetting demo data...
del /q backend\data\*.dat
echo Running seed program...
cd backend
.\seed_demo.exe
cd ..
echo Reset and seed complete!
