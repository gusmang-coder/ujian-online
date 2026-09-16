@echo off
title Upload ke GitHub - SMK TI Bali Global Badung
echo ========================================================
echo   MENGUNGGAH PROYEK CBT KE GITHUB (gusmang-coder/ujian-online)
echo ========================================================
echo.

cd /d "d:\Sekolah\smkti-cbt"
"C:\laragon\bin\git\cmd\git.exe" push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   BERHASIL! Proyek sudah tayang di GitHub Anda:
    echo   https://github.com/gusmang-coder/ujian-online
    echo ========================================================
) else (
    echo ========================================================
    echo   Ada kendala saat upload. Pastikan Anda sudah login
    echo   ke akun GitHub Anda pada jendela yang muncul.
    echo ========================================================
)
pause
