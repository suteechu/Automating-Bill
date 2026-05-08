@echo off
chcp 65001 >nul
echo ===================================================
echo       Auto Push ^& Deploy to GitHub Pages
echo ===================================================
echo.

:: ตรวจสอบว่ามีการ init git หรือยัง
if not exist .git (
    echo [Error] ยังไม่ได้ตั้งค่า Git repository (.git ไม่พบ)
    echo โปรดรัน 'git init' และ 'git remote add origin ^<URL^>' ก่อน
    echo.
    pause
    exit /b
)

:: รับข้อความ Commit จากผู้ใช้
set /p COMMIT_MSG="Enter commit message (กด Enter เพื่อใช้ข้อความอัตโนมัติ): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Auto-update: %date% %time%

:: รันคำสั่ง Git
echo.
echo [1/4] Adding files to git...
git add .

echo [2/4] Committing...
git commit -m "%COMMIT_MSG%"

echo [3/4] Pushing source code to GitHub...
git push origin HEAD

:: ตรวจสอบว่า Push ผ่านหรือไม่
if %errorlevel% neq 0 (
    echo.
    echo [Error] อัปโหลดโค้ดขึ้น GitHub ไม่สำเร็จ! (อ่านสาเหตุจากข้อความด้านบน)
    echo สาเหตุที่พบบ่อย: โค้ดบนเว็บกับในเครื่องไม่ตรงกัน ลองรันคำสั่ง "git pull origin main" ดูก่อนครับ
    pause
    exit /b
)

echo.
echo [4/4] Building and Deploying to GitHub Pages...
:: รันคำสั่ง build เพื่อสร้างไฟล์สำหรับใช้งานจริง
call npm.cmd run build

:: ตรวจสอบว่ามีโฟลเดอร์ dist ถูกสร้างขึ้นมาหรือไม่
if not exist dist (
    echo [Error] ไม่พบโฟลเดอร์ 'dist' หลังจากรัน Build 
    echo โปรดตรวจสอบว่าโปรเจกต์ของคุณตั้งค่า Build ออกมาเป็นโฟลเดอร์ชื่ออื่นหรือไม่ (เช่น 'build')
    pause
    exit /b
)

:: นำโฟลเดอร์ที่ build เสร็จ (มักจะเป็น dist สำหรับ Vite หรือ build สำหรับ CRA) ขึ้น gh-pages
call npx.cmd gh-pages -d dist

echo.
echo === เสร็จสิ้น! โค้ดถูกอัปเดตและเว็บกำลังถูกนำขึ้น GitHub Pages ===
echo (อาจต้องรอ 1-2 นาที กว่าหน้าเว็บจริงจะเปลี่ยนตาม)
pause