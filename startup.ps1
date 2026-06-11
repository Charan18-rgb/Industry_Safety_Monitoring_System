Write-Host "Starting AEGIS Intelligence Platform..." -ForegroundColor Green

$rootDir = Get-Location

# 1. Start AI Services
Write-Host "Starting AI Services (Port 8001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$rootDir\ai-services'; pip install -r requirements.txt; python run_api.py`""

# 2. Start Backend
Write-Host "Starting Backend Services (Port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$rootDir\backend'; pip install -r requirements.txt; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`""

# 3. Start Frontend
Write-Host "Starting Frontend (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$rootDir\frontend'; npm install; npm run dev`""

Write-Host "All components are starting in separate windows." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend: http://localhost:8000"
Write-Host "AI Services: http://localhost:8001"
