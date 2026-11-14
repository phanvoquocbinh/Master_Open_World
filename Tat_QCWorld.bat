@echo off
REM Tat web server QC World (cong 8770)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr "127.0.0.1:8770" ^| findstr LISTENING') do taskkill /PID %%p /F
echo Da tat QC World.
timeout /t 2 >nul
