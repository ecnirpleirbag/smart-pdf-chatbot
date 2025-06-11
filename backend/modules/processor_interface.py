# modules/processor_interface.py
import processor_bindings
from typing import List
import re

def add(a: int, b: int) -> int:
    """Test function - add two integers"""
    return processor_bindings.add(a, b)

def reverse_text(text: str) -> str:
    """Reverse text using C++ implementation"""
    return processor_bindings.reverse_text(text)

def clean_text(text: str) -> str:
    """
    Clean and normalize text
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    
    """Clean text by removing extra whitespaces using C++"""
    return processor_bindings.clean_text(text)

def split_into_chunks(text: str, chunk_size: int = 100) -> List[str]:
    """Split text into chunks using C++"""
    return processor_bindings.split_into_chunks(text, chunk_size)

def count_words(text: str) -> int:
    """Count words in text using C++"""
    return processor_bindings.count_words(text)