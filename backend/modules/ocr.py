from pdf2image import convert_from_path
from PIL import Image
import pytesseract
import os
import tempfile

def extract_text_from_pdf(pdf_path: str, poppler_path: str = None) -> str:
    with tempfile.TemporaryDirectory() as temp_dir:
        # Convert PDF to images with optional poppler_path
        images = convert_from_path(pdf_path, output_folder=temp_dir, fmt='png', poppler_path=poppler_path)
        
        full_text = ""
        for i, image in enumerate(images):
            text = pytesseract.image_to_string(image)
            full_text += f"--- Page {i+1} ---\n{text}\n\n"

        return full_text
