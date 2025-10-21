#!/bin/bash
# Quick verification script for anomaly detection fix

echo "=== Anomaly Detection Verification ==="
echo ""

# Check if backend is running
echo "1. Checking backend status..."
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "   ✓ Backend is running"
else
    echo "   ✗ Backend is NOT running"
    echo "   Start it with: cd backend && mvn spring-boot:run"
    exit 1
fi

# Check if Python script exists
echo ""
echo "2. Checking Python script..."
if [ -f "backend/python/anomaly_detection.py" ]; then
    echo "   ✓ anomaly_detection.py found"
else
    echo "   ✗ anomaly_detection.py NOT found"
    exit 1
fi

# Check if model exists
echo ""
echo "3. Checking YOLO model..."
if [ -f "backend/model/best.pt" ]; then
    echo "   ✓ best.pt model found"
elif [ -f "backend/python/model/best.pt" ]; then
    echo "   ✓ best.pt model found (fallback location)"
else
    echo "   ✗ best.pt model NOT found"
    echo "   Place it at: backend/model/best.pt"
    exit 1
fi

# Check Python dependencies
echo ""
echo "4. Checking Python environment..."
if python -c "import ultralytics" 2>/dev/null; then
    echo "   ✓ ultralytics package installed"
else
    echo "   ✗ ultralytics package NOT installed"
    echo "   Install with: pip install ultralytics"
    exit 1
fi

# Check for old failed-detections (should be minimal)
echo ""
echo "5. Checking temp file cleanup..."
FAILED_COUNT=$(find . -name "failed-detections" -type d 2>/dev/null | wc -l)
if [ $FAILED_COUNT -eq 0 ]; then
    echo "   ✓ No failed-detections folders (clean)"
elif [ $FAILED_COUNT -lt 3 ]; then
    echo "   ⚠ $FAILED_COUNT failed-detections folders found (check if recent)"
else
    echo "   ✗ $FAILED_COUNT failed-detections folders found (investigate)"
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Upload a thermal image with visible anomalies"
echo "2. Check frontend for displayed bounding boxes"
echo "3. Check backend logs for detection success"
echo "4. Verify database detectionJson field is populated"
echo ""
