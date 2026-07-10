@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ===================================================
:: ⚙️      ตัวแปรสำหรับตั้งค่า (Structural Variables)
:: ===================================================
set "REMOTE_URL=https://github.com/suteechu/Automating-Bill.git"
set "BRANCH_NAME=main"
set "VERCEL_URL=https://automating-bill.vercel.app/"

:: 📂 บังคับให้รันในโฟลเดอร์เดียวกับไฟล์ .bat เสมอ (แก้ปัญหาดับเบิลคลิกแล้วผิด Path)
cd /d "%~dp0"

echo ===================================================
echo      🚀 Auto Push ^& Deploy to GitHub Pages
echo ===================================================
echo.

:: 🔍 ตรวจสอบว่ามีการ init git หรือยัง
if not exist .git (
    echo [Info] ไม่พบ Git repository [.git] ระบบกำลังสร้างและตั้งค่าให้อัตโนมัติ...
    git init
    git remote add origin %REMOTE_URL%
    echo.
)

:: 📝 ตรวจสอบว่ามีไฟล์ให้ Commit หรือไม่
set "HAS_CHANGES="
for /f "delims=" %%i in ('git status --porcelain') do set HAS_CHANGES=1

:: ตรวจสอบเพิ่มเติมว่ามี commit ที่ยังไม่ได้ push หรือไม่ (กรณีแก้ conflict แล้วรันสคริปต์อีกครั้ง)
if not defined HAS_CHANGES (
    git fetch origin %BRANCH_NAME% >nul 2>&1
    for /f "delims=" %%i in ('git log origin/%BRANCH_NAME%..HEAD') do (
        echo [Info] พบ Commit ที่ยังไม่ได้ Push, กำลังจะ Push โค้ดขึ้น GitHub...
        set "SKIP_TO_PUSH=1"
        set "HAS_CHANGES=1"
    )
)

if not defined HAS_CHANGES (
    echo [Info] ไม่มีไฟล์ที่ต้อง Commit หรือ Push [โค้ดปัจจุบันอัปเดตล่าสุดอยู่แล้วครับ]
    echo.
    pause
    exit /b
)

:: ถ้ามีแค่ commit ที่รอ push ให้ข้ามไปขั้นตอน push เลย
if defined SKIP_TO_PUSH goto push_code

:: 💬 รับข้อความ Commit จากผู้ใช้
set "COMMIT_MSG="
set /p COMMIT_MSG="Enter commit message [กด Enter เพื่อใช้ข้อความอัตโนมัติ]: "
if not defined COMMIT_MSG (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "dt=%%I"
    set "YYYY=!dt:~0,4!"
    set "MM=!dt:~4,2!"
    set "DD=!dt:~6,2!"
    set "HH=!dt:~8,2!"
    set "MIN=!dt:~10,2!"
    set "SEC=!dt:~12,2!"
    set "COMMIT_MSG=Auto-update: !YYYY!-!MM!-!DD! !HH!:!MIN!:!SEC!"
)

:: ▶️ รันคำสั่ง Git
echo.
echo [Step 1/5] Adding files to git...
git add .

echo [Step 2/5] Committing...
git commit -m "%COMMIT_MSG%"

:: บังคับให้เป็น branch main เสมอ (ป้องกัน error ตอน push ครั้งแรก)
git branch -M %BRANCH_NAME%

echo [Step 3/5] Pulling latest code from GitHub...
git pull origin %BRANCH_NAME% --no-edit

:: ❗ ตรวจสอบว่า Pull ผ่านหรือไม่ (มีปัญหา Merge Conflict หรือไม่)
if %errorlevel% neq 0 (
    echo.
    echo [Error] การดึงโค้ด (Pull) จาก GitHub ไม่สำเร็จ! [อาจเกิดจากโค้ดชนกัน]
    echo ระบบกำลังเปิด VS Code เพื่อให้คุณแก้ไขไฟล์ที่มีปัญหา...
    call code .
    pause
    exit /b
)

:push_code
echo [Step 4/5] Pushing source code to GitHub...
git push origin HEAD

:: ❗ ตรวจสอบว่า Push ผ่านหรือไม่
if %errorlevel% neq 0 (
    echo.
    echo [Error] อัปโหลดโค้ดขึ้น GitHub ไม่สำเร็จ! [อ่านสาเหตุจากข้อความด้านบน]
    echo สาเหตุที่พบบ่อย: อาจเกิดโค้ดชนกัน [Merge Conflict] ระบบกำลังเปิด VS Code เพื่อให้คุณตรวจสอบ...
    call code .
    pause
    exit /b
)

echo.
echo === ✅ เสร็จสิ้น! โค้ดถูก Push ขึ้น GitHub แล้ว ===
echo [Vercel จะรับช่วงต่อ ทำการ Build และ Deploy ให้อัตโนมัติ ใช้เวลาประมาณ 1 นาที]

:: 🌐 เมื่อคุณได้ URL จาก Vercel แล้ว สามารถนำมาใส่แทนบรรทัดล่างนี้เพื่อเปิดเว็บอัตโนมัติได้เลย
:: start %VERCEL_URL%

pause