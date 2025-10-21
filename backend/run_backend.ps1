# PowerShell helper to run backend with PYTHON_EXEC set to conda environment (softwareProject)
Set-Location -Path $PSScriptRoot
$env:PYTHON_EXEC = "C:\Users\Rebecca Fernando\miniconda3\envs\softwareProject\python.exe"
Write-Host "Using PYTHON_EXEC=$env:PYTHON_EXEC"
# Pass python path to Spring Boot via system property python.exec
mvn -DskipTests -Dpython.exec="$env:PYTHON_EXEC" spring-boot:run
