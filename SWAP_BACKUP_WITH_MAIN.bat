@echo off
echo ========================================
echo  Swapping Backup with Main Code
echo ========================================
echo.
echo This will:
echo  1. Move current audit-backend to backup
echo  2. Move current audit-frontend to backup  
echo  3. Copy new features to main directories
echo.
pause

cd /d %~dp0

echo Step 1: Backing up current code...
if exist "audit-backend" (
    rmdir /s /q "backup-20251005-222610\audit-backend"
    xcopy "audit-backend" "backup-20251005-222610\audit-backend\" /E /I /H /Y >nul
    echo [OK] Current backend backed up
)

if exist "audit-frontend" (
    rmdir /s /q "backup-20251005-222610\audit-frontend"
    xcopy "audit-frontend" "backup-20251005-222610\audit-frontend\" /E /I /H /Y >nul
    echo [OK] Current frontend backed up
)

echo.
echo Step 2: Reading new features from temporary location...
if not exist "backup-20251005-222610-NEW" (
    echo [ERROR] New features directory not found!
    echo Please wait, I need to prepare it first.
    pause
    exit /b 1
)

echo.
echo Step 3: Removing old main directories...
if exist "audit-backend" rmdir /s /q "audit-backend"
if exist "audit-frontend" rmdir /s /q "audit-frontend"

echo.
echo Step 4: Copying new features to main...
xcopy "backup-20251005-222610-NEW\audit-backend" "audit-backend\" /E /I /H /Y >nul
echo [OK] New backend copied to main
xcopy "backup-20251005-222610-NEW\audit-frontend" "audit-frontend\" /E /I /H /Y >nul
echo [OK] New frontend copied to main

echo.
echo ========================================
echo  SUCCESS! Swap complete!
echo ========================================
echo.
echo Main directories now have NEW features
echo Backup has OLD version (before PAS implementation)
echo.
pause

