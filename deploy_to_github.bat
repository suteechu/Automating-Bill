@echo off
chcp 65001 >nul

:: บังคับให้รันในโฟลเดอร์เดียวกับไฟล์ .bat เสมอ (แก้ปัญหาดับเบิลคลิกแล้วผิด Path)
cd /d "%~dp0"

echo ===================================================
echo       Auto Push ^& Deploy to GitHub Pages
echo ===================================================
echo.

:: ตรวจสอบว่ามีการ init git หรือยัง
if not exist .git (
    echo [Info] ไม่พบ Git repository [.git] ระบบกำลังสร้างและตั้งค่าให้อัตโนมัติ...
    git init
    git remote add origin https://github.com/suteechu/Automating-Bill.git
    echo.
)

:: ตรวจสอบว่ามีไฟล์ให้ Commit หรือไม่
set "HAS_CHANGES="
for /f "delims=" %%i in ('git status --porcelain') do set HAS_CHANGES=1
if not defined HAS_CHANGES (
    echo [Info] ไม่มีไฟล์ไหนถูกแก้ไข [โค้ดปัจจุบันอัปเดตล่าสุดอยู่แล้วครับ]
    echo.
    pause
    exit /b
)

:: รับข้อความ Commit จากผู้ใช้
set "COMMIT_MSG="
set /p COMMIT_MSG="Enter commit message [กด Enter เพื่อใช้ข้อความอัตโนมัติ]: "
if not defined COMMIT_MSG set "COMMIT_MSG=Auto-update: %date% %time%"

:: รันคำสั่ง Git
echo.
echo [Step 1/5] Adding files to git...
git add .

echo [Step 2/5] Committing...
git commit -m "%COMMIT_MSG%"

:: บังคับให้เป็น branch main เสมอ (ป้องกัน error ตอน push ครั้งแรก)
git branch -M main

echo [Step 3/5] Pulling latest code from GitHub...
git pull origin main --no-edit --allow-unrelated-histories

:: ตรวจสอบว่า Pull ผ่านหรือไม่ (มีปัญหา Merge Conflict หรือไม่)
if %errorlevel% neq 0 (
    echo.
    echo [Error] การดึงโค้ด (Pull) จาก GitHub ไม่สำเร็จ! [อาจเกิดจากโค้ดชนกัน]
    echo ระบบกำลังเปิด VS Code เพื่อให้คุณแก้ไขไฟล์ที่มีปัญหา...
    call code .
    pause
    exit /b
)

echo [Step 4/5] Pushing source code to GitHub...
git push origin HEAD

:: ตรวจสอบว่า Push ผ่านหรือไม่
if %errorlevel% neq 0 (
    echo.
    echo [Error] อัปโหลดโค้ดขึ้น GitHub ไม่สำเร็จ! [อ่านสาเหตุจากข้อความด้านบน]
    echo สาเหตุที่พบบ่อย: อาจเกิดโค้ดชนกัน [Merge Conflict] ระบบกำลังเปิด VS Code เพื่อให้คุณตรวจสอบ...
    call code .
    pause
    exit /b
)

echo.
echo [Step 5/5] Building and Deploying to GitHub Pages...
:: รันคำสั่ง build เพื่อสร้างไฟล์สำหรับใช้งานจริง
call npm.cmd run build

:: ตรวจสอบว่ามีโฟลเดอร์ dist ถูกสร้างขึ้นมาหรือไม่
if not exist dist (
    echo [Error] ไม่พบโฟลเดอร์ 'dist' หลังจากรัน Build 
    echo โปรดตรวจสอบว่าโปรเจกต์ของคุณตั้งค่า Build ออกมาเป็นโฟลเดอร์ชื่ออื่นหรือไม่ [เช่น 'build']
    pause
    exit /b
)

:: นำโฟลเดอร์ที่ build เสร็จ (มักจะเป็น dist สำหรับ Vite หรือ build สำหรับ CRA) ขึ้น gh-pages
call npx.cmd gh-pages -d dist

echo.
echo === เสร็จสิ้น! โค้ดถูกอัปเดตและเว็บกำลังถูกนำขึ้น GitHub Pages ===
echo [รอประมาณ 1-2 นาที แล้วรีเฟรชหน้าเว็บเพื่อดูการเปลี่ยนแปลง]

:: เปิดหน้าเว็บ GitHub Pages อัตโนมัติ (อาจต้องรอสักพักกว่าเว็บจะอัปเดตเสร็จจริงๆ)
start https://suteechu.github.io/Automating-Bill/

pause