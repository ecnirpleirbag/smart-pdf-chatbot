@echo off
echo Building PDF ChatBot...

echo Building backend...
cd backend
pip install -r requirements.txt
cd ..

echo Building frontend...
cd PDFChatBot
npm install
npm run tauri build

echo Build complete!
pause 