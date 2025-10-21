@echo off
REM Setup Python Virtual Environment for Anomaly Detection

echo ========================================
echo Setting up Python Virtual Environment
echo ========================================

cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to PATH
    pause
    exit /b 1
)

echo.
echo Python found:
python --version

REM Create virtual environment
echo.
echo Creating virtual environment in .venv...
python -m venv .venv

if not exist ".venv\Scripts\python.exe" (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo Virtual environment created successfully!

REM Activate virtual environment and install dependencies
echo.
echo Installing required packages...
call .venv\Scripts\activate.bat

python -m pip install --upgrade pip
pip install ultralytics opencv-python numpy pillow

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Virtual environment location: %cd%\.venv
echo Python executable: %cd%\.venv\Scripts\python.exe
echo.
echo You can now run the backend application.
echo.
pause
