@echo off
echo ========================================
echo  PAS Implementation - Activate Backup
echo ========================================
echo.

cd /d %~dp0..

echo Step 1: Checking if original directories exist...
if exist "audit-backend-original" (
    echo [SKIP] Backup already activated - audit-backend-original exists
    goto :CheckFrontend
)

echo Step 2: Renaming original audit-backend...
if exist "audit-backend" (
    ren "audit-backend" "audit-backend-original"
    echo [OK] Original backend renamed to audit-backend-original
) else (
    echo [ERROR] audit-backend not found!
    pause
    exit /b 1
)

:CheckFrontend
if exist "audit-frontend-original" (
    echo [SKIP] Frontend already renamed - audit-frontend-original exists
    goto :CopyBackup
)

echo Step 3: Renaming original audit-frontend...
if exist "audit-frontend" (
    ren "audit-frontend" "audit-frontend-original"
    echo [OK] Original frontend renamed to audit-frontend-original
) else (
    echo [ERROR] audit-frontend not found!
    pause
    exit /b 1
)

:CopyBackup
echo.
echo Step 4: Copying backup to main directories...
xcopy "backup-20251005-222610\audit-backend" "audit-backend\" /E /I /H /Y >nul
echo [OK] Backend copied from backup
xcopy "backup-20251005-222610\audit-frontend" "audit-frontend\" /E /I /H /Y >nul
echo [OK] Frontend copied from backup

echo.
echo ========================================
echo  SUCCESS! Backup is now active!
echo ========================================
echo.
echo Your original code is safely stored in:
echo   - audit-backend-original
echo   - audit-frontend-original
echo.
echo You can now:
echo   1. Start backend:  cd audit-backend ^&^& npm start
echo   2. Start frontend: cd audit-frontend ^&^& npm run dev
echo.
echo To revert: Run REVERT_TO_ORIGINAL.bat
echo.
pause

