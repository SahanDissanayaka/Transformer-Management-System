# PowerShell helper to run backend with automatic .venv setup and requirements installation
Set-Location -Path $PSScriptRoot

# Check if .venv exists, if not create it
if (-not (Test-Path "python\.venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv "python\.venv"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error creating virtual environment"
        exit 1
    }
}

# Activate venv and install requirements
Write-Host "Activating virtual environment and installing requirements..."
& "python\.venv\Scripts\Activate.ps1"
pip install -r "python\requirements.txt"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing requirements"
    exit 1
}

# Set PYTHON_EXEC to the venv python
$env:PYTHON_EXEC = "$PSScriptRoot\python\.venv\Scripts\python.exe"
Write-Host "Using PYTHON_EXEC=$env:PYTHON_EXEC"

# Run Maven
mvn -D"python.exec=$env:PYTHON_EXEC" -DskipTests spring-boot:run
