@echo off
echo ===========================================
echo     BACKEND SETUP (Requires Python 3.10)
echo ===========================================

cd /d %~dp0

echo Checking for Python 3.10...
py -3.10 --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Python 3.10 is NOT installed!
    echo.
    echo You MUST install Python 3.10 before continuing.
    echo Download it here:
    echo https://www.python.org/downloads/release/python-31010/
    echo.
    pause
    exit /b 1
)

echo.
echo Removing old virtual environment (if it exists)...
IF EXIST venv rmdir /s /q venv

echo Creating virtual environment using Python 3.10...
py -3.10 -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing Python dependencies from python\requirements.txt ...
pip install -r python\requirements.txt

IF ERRORLEVEL 1 (
    echo.
    echo [ERROR] Failed to install some Python dependencies!
    echo Please check the output above for details.
    pause
    exit /b 1
)
echo ===========================================
echo     SETUP COMPLETED SUCCESSFULLY!
echo ===========================================
pause
