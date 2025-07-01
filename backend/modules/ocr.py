from pdf2image import convert_from_path, pdfinfo_from_path
from PIL import Image
import pytesseract
import os
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed

def _process_page(image: Image) -> str:
    """Helper function to run OCR on a single image."""
    return pytesseract.image_to_string(image)

def extract_text_from_pdf(pdf_path: str, poppler_path: str = None) -> str:
    """
    Extracts text from a PDF using a memory-efficient, parallelized approach.
    It processes the PDF in batches to keep memory usage low and uses multiple
    threads to speed up OCR on each batch.
    """
    try:
        info = pdfinfo_from_path(pdf_path, userpw=None, poppler_path=poppler_path)
        total_pages = info['Pages']
    except Exception as e:
        # Fallback or error if pdfinfo is not available
        print(f"Could not get PDF info, proceeding without page count. Error: {e}")
        total_pages = 0 # Indicates we don't know the page count

    full_text = []
    batch_size = 10  # Process 10 pages at a time
    
    # Determine the number of workers based on CPU cores, but not more than the batch size
    max_workers = min(os.cpu_count() or 1, batch_size)

    for i in range(1, total_pages + 1, batch_size):
        first_page = i
        last_page = min(i + batch_size - 1, total_pages)
        
        with tempfile.TemporaryDirectory() as temp_dir:
            images = convert_from_path(
                pdf_path,
                output_folder=temp_dir,
                fmt='png',
                poppler_path=poppler_path,
                first_page=first_page,
                last_page=last_page,
                thread_count=max_workers # Use threads for faster image conversion
            )
            
            page_texts = ["" for _ in range(len(images))]

            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                # Create a future for each page's OCR task
                future_to_index = {
                    executor.submit(_process_page, image): j for j, image in enumerate(images)
                }

                for future in as_completed(future_to_index):
                    index = future_to_index[future]
                    try:
                        text = future.result()
                        page_number = first_page + index
                        page_texts[index] = f"--- Page {page_number} ---\n{text}\n\n"
                    except Exception as exc:
                        page_number = first_page + index
                        print(f'Page {page_number} generated an exception: {exc}')

            full_text.extend(page_texts)

    return "".join(full_text)
