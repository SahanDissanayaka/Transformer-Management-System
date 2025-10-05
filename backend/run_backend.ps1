# PowerShell helper to run backend with PYTHON_EXEC set to the repo venv python
Set-Location -Path $PSScriptRoot
$env:PYTHON_EXEC = "C:\Users\Rebecca Fernando\Downloads\Try3\Transformer-Management-System-phase_02_develop\backend\python\.venv\Scripts\python.exe"
Write-Host "Using PYTHON_EXEC=$env:PYTHON_EXEC"
mvn -DskipTests spring-boot:run
