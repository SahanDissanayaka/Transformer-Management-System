@echo off
REM Verify Conda Environment has required packages

echo ========================================
echo Verifying Conda Environment: softwareProject
echo ========================================
echo.

set CONDA_PYTHON=C:\Users\Rebecca Fernando\miniconda3\envs\softwareProject\python.exe

if not exist "%CONDA_PYTHON%" (
    echo ERROR: Python not found at: %CONDA_PYTHON%
    echo Please check your conda environment name
    pause
    exit /b 1
)

echo Python found at: %CONDA_PYTHON%
echo.

echo Python version:
"%CONDA_PYTHON%" --version
echo.

echo Checking required packages...
echo.

"%CONDA_PYTHON%" -c "import ultralytics; print('✓ ultralytics:', ultralytics.__version__)" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ ultralytics - NOT INSTALLED
    set MISSING=1
) else (
    echo Package check passed
)

"%CONDA_PYTHON%" -c "import cv2; print('✓ opencv-python:', cv2.__version__)" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ opencv-python - NOT INSTALLED
    set MISSING=1
) else (
    echo Package check passed
)

"%CONDA_PYTHON%" -c "import numpy; print('✓ numpy:', numpy.__version__)" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ numpy - NOT INSTALLED
    set MISSING=1
) else (
    echo Package check passed
)

"%CONDA_PYTHON%" -c "from PIL import Image; print('✓ pillow: OK')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ pillow - NOT INSTALLED
    set MISSING=1
) else (
    echo Package check passed
)

echo.

if defined MISSING (
    echo ========================================
    echo MISSING PACKAGES DETECTED!
    echo ========================================
    echo.
    echo Run this command to install missing packages:
    echo.
    echo call "C:\Users\Rebecca Fernando\miniconda3\Scripts\activate" softwareProject
    echo pip install ultralytics opencv-python numpy pillow
    echo.
    pause
    exit /b 1
)

echo Testing YOLO model loading...
"%CONDA_PYTHON%" -c "from ultralytics import YOLO; model = YOLO('python/model/best.pt'); print('✓ Model loaded successfully!')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Failed to load YOLO model
    echo Make sure python/model/best.pt exists
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ All checks passed!
echo Environment is ready for anomaly detection
echo ========================================
echo.
pause
