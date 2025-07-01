#!/usr/bin/env python3
"""
Test script for PDF ChatBot system
"""

import sys
import os
import requests
import time
from pathlib import Path

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        from modules.processor_interface import add, clean_text, count_words
        print(" C++ bindings working")
        print(f"   Test: add(5, 3) = {add(5, 3)}")
    except ImportError as e:
        print(f" C++ bindings failed: {e}")
        return False
    
    try:
        from modules.llm_handler import LLMHandler
        print(" LLM handler imported")
    except ImportError as e:
        print(f" LLM handler failed: {e}")
        return False
    
    try:
        import pytesseract
        import pdf2image
        print(" OCR dependencies available")
    except ImportError as e:
        print(f" OCR dependencies failed: {e}")
        return False
    
    return True

def test_api_server():
    """Test if API server is running"""
    print("\nTesting API server...")
    
    try:
        response = requests.get("http://127.0.0.1:8000/", timeout=5)
        if response.status_code == 200:
            print(" API server is running")
            return True
        else:
            print(f" API server returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print(" API server not reachable")
        print("   Start with: uvicorn main:app --reload")
        return False

def test_ollama():
    """Test if Ollama is available"""
    print("\nTesting Ollama...")
    
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            print(" Ollama is running")
            print(f"   Available models: {[m['name'] for m in models]}")
            return True
        else:
            print(" Ollama not responding properly")
            return False
    except requests.exceptions.RequestException:
        print(" Ollama not available")
        print("   Install from: https://ollama.ai")
        print("   Then run: ollama pull llama2")
        return False

def test_directories():
    """Test if required directories exist"""
    print("\nTesting directories...")
    
    required_dirs = ["chroma_db", "temp"]
    all_good = True
    
    for dir_name in required_dirs:
        if os.path.exists(dir_name):
            print(f" {dir_name}/ exists")
        else:
            print(f" {dir_name}/ missing")
            os.makedirs(dir_name, exist_ok=True)
            print(f"   Created {dir_name}/")
    
    return all_good

def test_poppler():
    """Test Poppler installation"""
    print("\nTesting Poppler...")
    
    from config import Config
    
    if Config.validate_poppler_path():
        print(" Poppler path is valid")
        return True
    else:
        print(" Poppler path invalid")
        print("   Update POPPLER_PATH in config.py")
        return False

def main():
    """Run all tests"""
    print("PDF ChatBot System Test")
    print("=" * 30)
    
    tests = [
        test_directories,
        test_imports,
        test_poppler,
        test_api_server,
        test_ollama
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f" Test failed with exception: {e}")
            results.append(False)
    
    print("\n" + "=" * 30)
    print("Test Summary:")
    
    if all(results):
        print(" All tests passed! Your system is ready.")
    else:
        print("⚠  Some tests failed. Please fix the issues above.")
        
    return all(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)