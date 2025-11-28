@echo off
setlocal
echo ===========================================
echo      STARTING BACKEND (Spring Boot + Py)
echo ===========================================

REM Always work from this script's folder
cd /d %~dp0

echo Checking virtual environment...
IF NOT EXIST venv (
    echo.
    echo [ERROR] venv folder not found.
    echo Please run setup.bat first to create the environment.
    echo.
    pause
    exit /b 1
)

echo Activating Python virtual environment...
call venv\Scripts\activate

echo.
echo Starting Spring Boot backend using Maven...
mvn spring-boot:run

echo.
echo ===========================================
echo      BACKEND STOPPED
echo ===========================================
endlocal
pause
