@echo off
REM Run backend with PYTHON_EXEC set to conda environment (softwareProject)
cd /d "%~dp0"
set PYTHON_EXEC=C:\Users\Rebecca Fernando\miniconda3\envs\softwareProject\python.exe
echo Using PYTHON_EXEC=%PYTHON_EXEC%
REM Pass python path to Spring Boot via system property python.exec
mvn -DskipTests -Dpython.exec="%PYTHON_EXEC%" spring-boot:run
