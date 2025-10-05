@echo off
REM Run backend with PYTHON_EXEC set to the repo venv python (cmd)
cd /d "%~dp0"
set PYTHON_EXEC=C:\Users\Rebecca Fernando\Downloads\Try3\Transformer-Management-System-phase_02_develop\backend\python\.venv\Scripts\python.exe
necho Using PYTHON_EXEC=%PYTHON_EXEC%
mvn -DskipTests spring-boot:run
