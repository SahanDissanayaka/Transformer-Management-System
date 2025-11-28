@echo off
REM Run backend with PYTHON_EXEC set to the conda environment python (cmd)
cd /d "%~dp0"
set PYTHON_EXEC=%USERPROFILE%\miniconda3\envs\softwareProject\python.exe
echo Using PYTHON_EXEC=%PYTHON_EXEC%
mvn -Dpython.exec="%PYTHON_EXEC%" -DskipTests spring-boot:run
