@echo off
cd /d C:\work\moon
call npx tsc --noEmit
echo TSC_EXIT=%errorlevel%
call npx vite build
echo VITE_EXIT=%errorlevel%
