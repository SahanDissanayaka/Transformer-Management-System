@echo off
REM Comprehensive Backend Diagnostics

echo ========================================
echo Backend Diagnostics
echo ========================================
echo.

cd /d "%~dp0"

echo [1] Checking Conda Python Path...
set PYTHON_EXEC=C:\Users\Rebecca Fernando\miniconda3\envs\softwareProject\python.exe

if exist "%PYTHON_EXEC%" (
    echo    [OK] Python found at: %PYTHON_EXEC%
    "%PYTHON_EXEC%" --version
) else (
    echo    [ERROR] Python NOT found at: %PYTHON_EXEC%
    echo    Please check your conda environment name
    goto :error
)
echo.

echo [2] Checking Python Packages...
"%PYTHON_EXEC%" -c "import ultralytics; print('   [OK] ultralytics:', ultralytics.__version__)" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    [ERROR] ultralytics NOT installed
    set MISSING_PKG=1
)

"%PYTHON_EXEC%" -c "import cv2; print('   [OK] opencv-python:', cv2.__version__)" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    [ERROR] opencv-python NOT installed
    set MISSING_PKG=1
)

"%PYTHON_EXEC%" -c "import numpy; print('   [OK] numpy:', numpy.__version__)" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    [ERROR] numpy NOT installed
    set MISSING_PKG=1
)

if defined MISSING_PKG (
    echo.
    echo [ACTION NEEDED] Install missing packages:
    echo    call "C:\Users\Rebecca Fernando\miniconda3\Scripts\activate" softwareProject
    echo    pip install ultralytics opencv-python numpy pillow
    goto :error
)
echo.

echo [3] Checking YOLO Model...
if exist "python\model\best.pt" (
    echo    [OK] Model found at: python\model\best.pt
) else (
    echo    [ERROR] Model NOT found at: python\model\best.pt
    goto :error
)
echo.

echo [4] Checking anomaly_detection.py...
if exist "python\anomaly_detection.py" (
    echo    [OK] Script found at: python\anomaly_detection.py
) else (
    echo    [ERROR] Script NOT found
    goto :error
)
echo.

echo [5] Testing Python YOLO Detection...
"%PYTHON_EXEC%" python\anomaly_detection.py --help >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Python script can run
) else (
    echo    [WARNING] Script may have issues
)
echo.

echo [6] Checking Maven...
mvn --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    [ERROR] Maven not found in PATH
    goto :error
) else (
    echo    [OK] Maven found
    mvn --version | findstr "Apache Maven"
)
echo.

echo [7] Checking Java...
java -version 2>&1 | findstr "version"
echo.

echo [8] Checking pom.xml...
if exist "pom.xml" (
    echo    [OK] pom.xml found
) else (
    echo    [ERROR] pom.xml NOT found
    goto :error
)
echo.

echo ========================================
echo All Checks Passed!
echo ========================================
echo.
echo Backend is ready to run. Use:
echo    run_backend.cmd
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo Diagnostics Failed!
echo ========================================
echo Fix the issues above before running backend
echo.
pause
exit /b 1
