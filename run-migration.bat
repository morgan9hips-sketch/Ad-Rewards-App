@echo off
cd /d C:\Ad-Rewards-App\backend
echo Running Prisma migration...
if "%DATABASE_URL%"=="" (
	echo ERROR: DATABASE_URL is not set.
	echo Set DATABASE_URL in your environment before running this script.
	exit /b 1
)
call npx prisma migrate deploy
echo Migration completed with exit code: %ERRORLEVEL%
pause
