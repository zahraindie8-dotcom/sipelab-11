@echo off
title SiLab Dev Launcher
rem ============================================================
rem  Launcher development SiLab (Windows + Laragon)
rem  Backend : http://127.0.0.1:8000  (Laravel API)
rem  Frontend: http://localhost:5173  (Vite + React)
rem  Sesuaikan path PHP/Node jika berbeda di mesin Anda.
rem ============================================================

set PHP="E:\LARAGON\bin\php\php-8.1.10-Win32-vs16-x64\php.exe"
set NODE="E:\note-js\node.exe"

if not exist %PHP% (
  echo [!] PHP tidak ditemukan di %PHP% - edit start-dev.bat
  pause
  exit /b 1
)
if not exist %NODE% (
  echo [!] Node tidak ditemukan di %NODE% - edit start-dev.bat
  pause
  exit /b 1
)

echo Memulai backend Laravel di http://127.0.0.1:8000 ...
cd /d "%~dp0backend"
start "SiLab Backend (8000)" %PHP% artisan serve --host=127.0.0.1 --port=8000

echo Memulai frontend Vite di http://localhost:5173 ...
cd /d "%~dp0frontend"
start "SiLab Frontend (5173)" %NODE% node_modules\vite\bin\vite.js

echo.
echo SiLab berjalan. Buka http://localhost:5173 di browser.
echo Akun demo: admin@guru/siswa @sipelab.test (password: password)
echo.
pause
