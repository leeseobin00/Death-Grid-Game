@echo off
echo ========================================
echo   REAPER'S HARVEST - Starting Server
echo ========================================
echo.
echo Opening game in your browser...
echo Press Ctrl+C to stop the server
echo.

REM Try to start with Python
python -m http.server 8000 2>nul
if %errorlevel% equ 0 goto :opened

REM If Python fails, try opening file directly
echo Python not found. Opening file directly...
start index.html
goto :end

:opened
start http://localhost:8000

:end
echo.
echo Game should open in your browser!
echo If not, double-click index.html
pause
