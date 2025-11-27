@echo off
REM Run backend with automatic .venv setup and requirements installation
cd /d "%~dp0"

REM Check if .venv exists, if not create it
if not exist "python\.venv" (
    echo Creating virtual environment...
    python -m venv "python\.venv"
    if errorlevel 1 (
        echo Error creating virtual environment
        exit /b 1
    )
)

REM Activate venv and install requirements
echo Activating virtual environment and installing requirements...
call "python\.venv\Scripts\activate.bat"
pip install -r "python\requirements.txt"
if errorlevel 1 (
    echo Error installing requirements
    exit /b 1
)

REM Set PYTHON_EXEC to the venv python
set PYTHON_EXEC=%cd%\python\.venv\Scripts\python.exe
echo Using PYTHON_EXEC=%PYTHON_EXEC%

REM Run Maven
mvn -Dpython.exec="%PYTHON_EXEC%" -DskipTests spring-boot:run
