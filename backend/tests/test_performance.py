import sys
import time
import os
import traceback

# Add backend directory to python path to resolve imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from modules import ocr
from config import Config

def test_pdf_extraction_performance(pdf_path: str):
    """
    Tests the performance of the PDF text extraction.
    """
    print(f"Testing performance for: {pdf_path}")
    
    start_time = time.time()
    
    try:
        text = ocr.extract_text_from_pdf(pdf_path, poppler_path=Config.POPPLER_PATH)
        end_time = time.time()
        
        duration = end_time - start_time
        num_pages = text.count("--- Page")
        words = len(text.split())
        
        print("\n--- Performance Results ---")
        print(f"Total processing time: {duration:.2f} seconds")
        if num_pages > 0:
            print(f"Time per page: {duration / num_pages:.2f} seconds")
        print(f"Total pages extracted: {num_pages}")
        print(f"Total words extracted: {words}")
        print("---------------------------\n")

    except Exception as e:
        traceback.print_exc()
        print(f"An error occurred during performance testing: {e}")
        end_time = time.time()
        duration = end_time - start_time
        print(f"Test failed after {duration:.2f} seconds.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python tests/test_performance.py <path_to_pdf>")
        sys.exit(1)
        
    pdf_file_path = sys.argv[1]
    test_pdf_extraction_performance(pdf_file_path) 