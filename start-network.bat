@echo off
title Audit Backend - Network Mode
color 0B

echo ========================================
echo   AUDIT BACKEND - NETWORK MODE
echo ========================================
echo.

echo Starting backend server on network...
echo Server will be accessible at: http://192.168.1.100:3000
echo.

echo IMPORTANT: Make sure your frontend is running with:
echo   cd ../audit-frontend
echo   start-network.bat
echo.

echo Starting backend server...
node app.js --host 0.0.0.0

echo.
echo Backend stopped. Press any key to exit...
pause >nul
