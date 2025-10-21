@echo off
REM Test Python Virtual Environment Setup

cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo ERROR: Virtual environment not found!
    echo Please run setup_venv.cmd first
    pause
    exit /b 1
)

echo Testing Python virtual environment...
echo.

call .venv\Scripts\activate.bat

echo Python version:
python --version
echo.

echo Checking required packages:
echo.

python -c "import ultralytics; print('✓ ultralytics:', ultralytics.__version__)"
python -c "import cv2; print('✓ opencv-python:', cv2.__version__)"
python -c "import numpy; print('✓ numpy:', numpy.__version__)"
python -c "from PIL import Image; print('✓ pillow: OK')"

echo.
echo Testing YOLO model loading...
python -c "from ultralytics import YOLO; model = YOLO('model/best.pt'); print('✓ Model loaded successfully!')"

echo.
echo ========================================
echo All tests passed!
echo ========================================
pause
