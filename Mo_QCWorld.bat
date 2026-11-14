@echo off
REM Dung file nay neu file .vbs bi chan
cd /d "%~dp0"
set DASH=%~dp0..\Master Dashboard
set PY=%DASH%\runtime\pythonw.exe
if not exist "%PY%" set PY=pythonw
if exist "%DASH%\app\server.py" start "" "%PY%" "%DASH%\app\server.py" --background
REM Tat server QC World cu (neu con sot) roi chay server moi
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -like 'python*' -and $_.CommandLine -match '8770' -and $_.CommandLine -match 'http\.server|serve\.py' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
start "" "%PY%" "%~dp0serve.py" 8770
set /a n=0
:wait
timeout /t 1 /nobreak >nul
curl -s -o nul -m 2 http://127.0.0.1:8770/__qcworld && goto open
set /a n+=1
if %n% lss 10 goto wait
echo Khong bat duoc server QC World (cong 8770). Hay chay Tat_QCWorld.bat roi thu lai.
pause
exit /b 1
:open
start "" "http://127.0.0.1:8770/world.html"
