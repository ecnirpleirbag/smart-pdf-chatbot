import pytest
from fastapi.testclient import TestClient
from main import app
import os
import tempfile

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "PDF ChatBot API is running!"}

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()
    assert "model" in response.json()

def test_chat_without_document():
    response = client.post("/chat", json={"query": "test query"})
    assert response.status_code == 200
    assert "No document found" in response.json()["response"]

def test_upload_invalid_file():
    # Create a temporary text file
    with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as temp_file:
        temp_file.write(b"test content")
        temp_file.flush()
        
        with open(temp_file.name, "rb") as f:
            response = client.post(
                "/extract-text",
                files={"file": ("test.txt", f, "text/plain")}
            )
    
    os.unlink(temp_file.name)
    assert response.status_code == 400
    assert "Only PDF files are allowed" in response.json()["detail"] 