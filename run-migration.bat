@echo off
cd /d C:\Ad-Rewards-App\backend
echo Running Prisma migration...
set DATABASE_URL=postgresql://postgres.yvgdzwzyaxzwwunnmlhc:AdRevTechSupa2026!@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require
call npx prisma migrate deploy
echo Migration completed with exit code: %ERRORLEVEL%
pause
