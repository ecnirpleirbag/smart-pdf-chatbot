@echo off
echo Building PDF ChatBot...

echo.
echo Step 1: Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Step 2: Building C++ extensions...
python setup.py build_ext --inplace

echo.
echo Step 3: Testing C++ bindings...
python -c "from modules.processor_interface import add; print('C++ binding test:', add(5, 3))"

echo.
echo Step 4: Creating necessary directories...
if not exist "chroma_db" mkdir chroma_db
if not exist "temp" mkdir temp

echo.
echo Build complete!
echo.
echo To run the application:
echo 1. Backend: uvicorn main:app --reload
echo 2. Frontend: npm run tauri dev (in your Tauri directory)
echo.
echo For full LLM functionality, install Ollama:
echo 1. Download from https://ollama.ai
echo 2. Run: ollama pull llama2
echo.
pause