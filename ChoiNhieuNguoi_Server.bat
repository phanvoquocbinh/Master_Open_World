@echo off
REM QC World - server NHIEU NGUOI CHOI (chi may nay: 127.0.0.1:8790). Dong cua so nay de tat server.
REM Server chi chuyen vi tri / ten / chat / cu chi - khong chua token, khong doc du lieu Dashboard.
cd /d "%~dp0"
chcp 65001 >nul
set PY=%~dp0..\Master Dashboard\runtime\python.exe
if not exist "%PY%" set PY=python
"%PY%" "%~dp0multiplayer_server.py" 8790
pause
