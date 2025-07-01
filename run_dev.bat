@echo off
echo Starting PDF ChatBot development environment...

:: Activate virtual environment
call backend\venv\Scripts\activate.bat

:: Start backend server
start cmd /k "cd backend && uvicorn main:app --reload --host 127.0.0.1 --port 8000"

:: Start frontend development server
start cmd /k "npm run dev"

echo Development servers started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173 