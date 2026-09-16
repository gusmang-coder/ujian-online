@echo off
title Share Online - SMK TI Bali Global Badung (CBT)
echo ====================================================================
echo   MEMBUAT LINK ONLINE PUBLIK - CBT SMK TI BALI GLOBAL BADUNG
echo ====================================================================
echo.
echo Link ini memungkinkan website CBT di laptop Anda dibuka langsung
echo dari HP, laptop lain, atau oleh guru (Pak Ade).
echo.
echo CATATAN PENTING:
echo 1. Pastikan server lokal aktif (jalankan serve.bat atau Laragon).
echo 2. Jangan tutup jendela ini selama ingin website bisa diakses online.
echo.
echo ====================================================================
echo Menghubungkan ke internet...
echo ====================================================================
echo.

cd /d "%~dp0"
call npx.cmd localtunnel --port 8000

pause
