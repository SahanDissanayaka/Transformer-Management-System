@echo off
REM Complete Backend Startup Script with Conda Environment

echo ========================================
echo Starting Transformer Management Backend
echo ========================================
echo.

cd /d "%~dp0"

REM Step 1: Set Conda Python Path
set PYTHON_EXEC=C:\Users\Rebecca Fernando\miniconda3\envs\softwareProject\python.exe
echo [1/5] Python Configuration
echo       Path: %PYTHON_EXEC%

REM Step 2: Verify Python exists
if not exist "%PYTHON_EXEC%" (
    echo       [ERROR] Python not found!
    echo.
    echo       Please ensure your Conda environment 'softwareProject' exists.
    echo       Create it with:
    echo          conda create -n softwareProject python=3.10
    echo          conda activate softwareProject
    echo          pip install ultralytics opencv-python numpy pillow
    echo.
    pause
    exit /b 1
)
echo       [OK] Python found
echo.

REM Step 3: Quick package check
echo [2/5] Checking Python Packages...
"%PYTHON_EXEC%" -c "import ultralytics, cv2, numpy" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo       [WARNING] Some packages may be missing
    echo       Install with: pip install ultralytics opencv-python numpy pillow
    echo       Continuing anyway...
) else (
    echo       [OK] Required packages found
)
echo.

REM Step 4: Check model file
echo [3/5] Checking YOLO Model...
if exist "python\model\best.pt" (
    echo       [OK] Model file found
) else (
    echo       [WARNING] Model file not found at python\model\best.pt
    echo       Detection may fail without this file
)
echo.

REM Step 5: Start Maven with proper Python path
echo [4/5] Compiling and Starting Backend...
echo       This may take a minute on first run...
echo.

REM Pass python.exec as system property to Spring Boot
mvn -DskipTests -Dpython.exec="%PYTHON_EXEC%" spring-boot:run

REM If Maven fails
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo Backend Failed to Start
    echo ========================================
    echo.
    echo Check the errors above for details
    pause
    exit /b 1
)

echo.
echo [5/5] Backend Stopped
pause
