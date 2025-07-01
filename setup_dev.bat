@echo off
echo Setting up PDF ChatBot development environment...

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed! Please install Python 3.11 or later.
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed! Please install Node.js 18 or later.
    exit /b 1
)

:: Create and activate virtual environment
echo Creating Python virtual environment...
python -m venv backend/venv
call backend\venv\Scripts\activate.bat

:: Install backend dependencies
echo Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..

:: Install frontend dependencies
echo Installing frontend dependencies...
npm install

:: Create necessary directories
echo Creating necessary directories...
mkdir backend\chroma_db 2>nul
mkdir backend\__pycache__ 2>nul

:: Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    echo VITE_API_URL=http://localhost:8000 > .env
)

echo Setup complete! You can now run the application.
echo To start the backend: cd backend && uvicorn main:app --reload --host 127.0.0.1 --port 8000
echo To start the frontend: npm run dev 