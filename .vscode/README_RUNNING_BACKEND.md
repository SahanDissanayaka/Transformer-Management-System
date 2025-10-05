Run backend from VS Code (recommended)

1) Open the Command Palette (Ctrl+Shift+P) and run: Tasks: Run Task
2) Choose either:
   - Run TransformerUI (jar)
   - Run TransformerUI (maven)

Notes:
- The Maven task now injects `-Dpython.exec=${workspaceFolder}/backend/python/.venv/Scripts/python.exe` so the Java runner will invoke the project's venv Python automatically.
- If anomaly detection still fails, open the integrated terminal where the task runs and look for messages that start with `[anomaly_detection]` (these are stderr logs from the Python script) or Java exceptions that include `PY_ERR` or `PY_PARSE_ERR`.

Debugging tips:
- List preserved debug images: GET /dev/failed-detections
- Download preserved image: GET /dev/failed-detections/download/{fileName}
- Run Python detector locally:
  cd backend/python
  .venv\Scripts\python.exe anomaly_detection.py --image "C:\path\to\preserved.jpg"

If the maven/spring-boot:run task still doesn't run detection, paste the server logs (the block printed when you trigger a detect) and I'll analyze them.
