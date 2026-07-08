@echo off
cd /d C:\work\moon
echo ===TSC_START===
call node node_modules\typescript\lib\tsc.js --noEmit
echo ===TSC_EXIT_%ERRORLEVEL%===
echo ===BUILD_START===
call node node_modules\vite\bin\vite.js build
echo ===BUILD_EXIT_%ERRORLEVEL%===
