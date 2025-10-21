# PowerShell helper to run backend with PYTHON_EXEC set to the conda environment python
Set-Location -Path $PSScriptRoot
$env:PYTHON_EXEC = "$env:USERPROFILE\miniconda3\envs\softwareProject\python.exe"
Write-Host "Using PYTHON_EXEC=$env:PYTHON_EXEC"
mvn -D"python.exec=$env:PYTHON_EXEC" -DskipTests spring-boot:run
