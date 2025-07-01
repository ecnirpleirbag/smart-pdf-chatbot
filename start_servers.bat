@echo off
start powershell -NoExit -Command "cd backend; .\.venv\Scripts\activate; uvicorn main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 5
start powershell -NoExit -Command "cd PDFChatBot; npm run dev" 