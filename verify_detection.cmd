@echo off
REM Quick verification script for anomaly detection fix (Windows)

echo === Anomaly Detection Verification ===
echo.

REM Check if backend is running
echo 1. Checking backend status...
curl -s http://localhost:8080/actuator/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] Backend is running
) else (
    echo    [FAIL] Backend is NOT running
    echo    Start it with: cd backend ^&^& mvn spring-boot:run
    exit /b 1
)

REM Check if Python script exists
echo.
echo 2. Checking Python script...
if exist "backend\python\anomaly_detection.py" (
    echo    [OK] anomaly_detection.py found
) else (
    echo    [FAIL] anomaly_detection.py NOT found
    exit /b 1
)

REM Check if model exists
echo.
echo 3. Checking YOLO model...
if exist "backend\model\best.pt" (
    echo    [OK] best.pt model found
) else if exist "backend\python\model\best.pt" (
    echo    [OK] best.pt model found ^(fallback location^)
) else (
    echo    [FAIL] best.pt model NOT found
    echo    Place it at: backend\model\best.pt
    exit /b 1
)

REM Check Python dependencies
echo.
echo 4. Checking Python environment...
python -c "import ultralytics" 2>nul
if %errorlevel% equ 0 (
    echo    [OK] ultralytics package installed
) else (
    echo    [FAIL] ultralytics package NOT installed
    echo    Install with: pip install ultralytics
    exit /b 1
)

echo.
echo === Verification Complete ===
echo.
echo Next steps:
echo 1. Upload a thermal image with visible anomalies
echo 2. Check frontend for displayed bounding boxes
echo 3. Check backend logs for detection success
echo 4. Verify database detectionJson field is populated
echo.
pause
