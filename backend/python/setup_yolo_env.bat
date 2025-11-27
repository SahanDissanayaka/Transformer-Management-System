@echo off
echo ==========================================
echo        YOLO ENVIRONMENT SETUP
echo           (Python 3.10 Required)
echo ==========================================

REM Jump to directory of script
cd /d %~dp0

echo [*] Searching for Python 3.10...

REM Try default Python 3.10 install paths
set PY310_1=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python310\python.exe
set PY310_2=C:\Program Files\Python310\python.exe
set PY310_3=C:\Program Files (x86)\Python310\python.exe

set PYTHON_EXEC=

if exist "%PY310_1%" set PYTHON_EXEC=%PY310_1%
if exist "%PY310_2%" set PYTHON_EXEC=%PY310_2%
if exist "%PY310_3%" set PYTHON_EXEC=%PY310_3%

IF "%PYTHON_EXEC%"=="" (
    echo [!] Python 3.10 was NOT found.
    echo -----------------------------------------
    echo Install Python 3.10 from:
    echo https://www.python.org/downloads/release/python-31011/
    echo -----------------------------------------
    pause
    exit /b 1
)

echo [✓] Found Python 3.10 at:
echo %PYTHON_EXEC%

echo [*] Creating virtual environment with Python 3.10...
"%PYTHON_EXEC%" -m venv venv

echo [*] Activating environment...
call venv\Scripts\activate

echo [*] Upgrading pip, setuptools, wheel...
pip install --upgrade pip setuptools wheel

echo [*] Installing dependencies (precompiled wheels only)...
pip install --only-binary=:all: -r requirements.txt

IF ERRORLEVEL 1 (
    echo [!] Installing default wheels failed.
    echo [*] Trying Windows wheel repository...
    pip install -r requirements.txt --extra-index-url https://download.lfd.uci.edu/pythonlibs/
)

echo.
echo [✓] YOLO Environment Setup Complete!
echo ------------------------------------------
echo Python Interpreter for Spring Boot:
echo   %cd%\venv\Scripts\python.exe
echo ------------------------------------------
pause
