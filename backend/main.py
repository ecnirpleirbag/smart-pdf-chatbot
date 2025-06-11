from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from modules import ocr
from modules import processor_interface
import shutil
import os
import tempfile
import uuid
from typing import Dict, Any, List
from sentence_transformers import SentenceTransformer, util
import numpy as np
from config import Config

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
Config.create_directories()

# Validate Poppler installation
if not Config.validate_poppler_path():
    print("WARNING: Poppler is not properly installed. PDF processing may not work.")
    print("Please install Poppler from: https://github.com/oschwartz10612/poppler-windows/releases/")
    print("After installation, make sure to add the Poppler bin directory to your PATH")

# Store document metadata
documents_store: Dict[str, Dict[str, Any]] = {}

# Load the sentence transformer model
model = SentenceTransformer(Config.EMBEDDING_MODEL)

class ChatRequest(BaseModel):
    query: str
    document_id: str = None

class ChatResponse(BaseModel):
    response: str
    sources: list = []

def split_text_into_chunks(text: str, chunk_size: int = 500) -> List[str]:
    """Split text into overlapping chunks."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size // 2):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def get_most_relevant_chunks(query: str, chunks: List[str], top_k: int = 3) -> List[str]:
    """Get the most relevant chunks for a query using sentence transformers."""
    query_embedding = model.encode(query, convert_to_tensor=True)
    chunk_embeddings = model.encode(chunks, convert_to_tensor=True)
    
    # Calculate cosine similarity
    similarities = util.pytorch_cos_sim(query_embedding, chunk_embeddings)[0]
    
    # Get top k chunks
    top_indices = similarities.argsort(descending=True)[:top_k]
    return [chunks[i] for i in top_indices]

def generate_summary(text: str) -> str:
    """Generate a summary using sentence transformers."""
    chunks = split_text_into_chunks(text)
    if not chunks:
        return "No text content found to summarize."
    
    # Get embeddings for all chunks
    chunk_embeddings = model.encode(chunks, convert_to_tensor=True)
    
    # Calculate mean embedding
    mean_embedding = chunk_embeddings.mean(dim=0)
    
    # Find the chunk most similar to the mean embedding
    similarities = util.pytorch_cos_sim(mean_embedding.unsqueeze(0), chunk_embeddings)[0]
    most_representative_idx = similarities.argmax().item()
    
    return chunks[most_representative_idx]

@app.get("/")
def read_root():
    return {"message": "PDF ChatBot API is running!"}

@app.get("/add")
def add_numbers(a: int, b: int):
    """Test endpoint for C++ bindings"""
    result = processor_interface.add(a, b)
    return {"result": result}

@app.post("/extract-text")
async def extract_text_from_pdf(file: UploadFile = File(...)):
    """Extract text from PDF and store in vector database"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Generate unique document ID
    document_id = str(uuid.uuid4())
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_path = temp_file.name
    
    try:
        # Extract text using OCR
        try:
            extracted_text = ocr.extract_text_from_pdf(temp_path, poppler_path=Config.POPPLER_PATH)
            if not extracted_text or len(extracted_text.strip()) == 0:
                return {
                    "error": "Failed to extract text from PDF",
                    "status": "error",
                    "details": "The PDF might be empty, corrupted, or contain only images. Please check the file and try again."
                }
        except Exception as e:
            return {
                "error": "PDF processing error",
                "status": "error",
                "details": f"Failed to process PDF: {str(e)}. Please make sure Poppler is properly installed."
            }
        
        # Clean text using C++ bindings
        cleaned_text = processor_interface.clean_text(extracted_text)
        
        # Store document metadata
        documents_store[document_id] = {
            "filename": file.filename,
            "text": cleaned_text,
            "word_count": processor_interface.count_words(cleaned_text)
        }
        
        return {
            "document_id": document_id,
            "filename": file.filename,
            "extracted_text": cleaned_text,
            "word_count": documents_store[document_id]["word_count"],
            "status": "success",
            "message": "Document processed and ready for chat"
        }
        
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        return {
            "error": str(e),
            "traceback": tb,
            "status": "error",
            "message": "Failed to process document"
        }
    finally:
        os.remove(temp_path)

@app.post("/chat", response_model=ChatResponse)
async def chat_with_document(request: ChatRequest):
    try:
        # Retrieve the document text
        doc_id = request.document_id
        if not doc_id or doc_id not in documents_store:
            return ChatResponse(
                response="No document found. Please upload a PDF first.",
                sources=[]
            )
        
        document_text = documents_store[doc_id]["text"]
        chunks = split_text_into_chunks(document_text)
        
        # If the query is about summarizing, use the summarization function
        if "summarize" in request.query.lower() or "summary" in request.query.lower():
            response = generate_summary(document_text)
            sources = [{
                "text": chunk,
                "similarity": 1.0,
                "metadata": {"type": "summary"}
            } for chunk in chunks[:3]]  # Include top 3 chunks as sources
        else:
            # Get most relevant chunks for the query
            relevant_chunks = get_most_relevant_chunks(request.query, chunks)
            
            # Combine relevant chunks for response
            response = "\n\n".join(relevant_chunks)
            
            # Format sources
            sources = []
            for chunk in relevant_chunks:
                sources.append({
                    "text": chunk,
                    "similarity": 1.0,
                    "metadata": {"type": "relevant_chunk"}
                })
        
        return ChatResponse(response=response, sources=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.get("/documents")
def list_documents():
    """List all uploaded documents"""
    return {"documents": documents_store}

@app.delete("/documents/{document_id}")
def delete_document(document_id: str):
    """Delete a specific document"""
    if document_id in documents_store:
        del documents_store[document_id]
        # Note: ChromaDB doesn't have easy single-document deletion
        # You might need to rebuild the collection or implement document filtering
        return {"message": f"Document {document_id} deleted"}
    else:
        raise HTTPException(status_code=404, detail="Document not found")

@app.delete("/documents")
def clear_all_documents():
    """Clear all documents"""
    documents_store.clear()
    return {"message": "All documents cleared"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "model": Config.EMBEDDING_MODEL}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)