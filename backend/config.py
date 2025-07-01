import os
from pathlib import Path

class Config:
    # Paths
    BASE_DIR = Path(__file__).parent
    
    # Poppler paths for different operating systems
    POPPLER_PATHS = {
        'win32': [
            r"C:\Program Files\poppler-24.02.0\Library\bin",  # Default Windows install
            r"C:\Program Files (x86)\poppler-24.02.0\Library\bin",
            os.path.expanduser("~/Downloads/poppler-24.02.0/Library/bin"),
            os.path.expanduser("~/poppler-24.02.0/Library/bin"),
        ],
        'linux': [
            "/usr/bin",
            "/usr/local/bin",
            "/opt/poppler/bin"
        ],
        'darwin': [
            "/usr/local/bin",
            "/opt/homebrew/bin",
            "/usr/bin"
        ]
    }
    
    # Try to find Poppler in the system
    POPPLER_PATH = None
    for path in POPPLER_PATHS.get(os.name, []):
        if os.path.exists(path):
            POPPLER_PATH = path
            break
    
    # If Poppler not found, use a default path
    if not POPPLER_PATH:
        POPPLER_PATH = os.path.join(BASE_DIR, "poppler", "bin")
        os.makedirs(POPPLER_PATH, exist_ok=True)
    
    CHROMA_DB_PATH = BASE_DIR / "chroma_db"
    TEMP_DIR = BASE_DIR / "temp"
    
    # API Settings
    API_HOST = "127.0.0.1"
    API_PORT = 8000
    
    # CORS Origins
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default port
        "tauri://localhost", 
        "http://localhost:1420",
        "https://tauri.localhost"
    ]
    
    # SentenceTransformer Settings
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # Fast and good for English
    
    # Text Processing
    CHUNK_SIZE = 500  # words per chunk
    OVERLAP_SIZE = 50  # word overlap between chunks
    MAX_SEARCH_RESULTS = 5
    
    # File Upload Limits
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS = ['.pdf']
    
    @classmethod
    def create_directories(cls):
        """Create necessary directories"""
        cls.CHROMA_DB_PATH.mkdir(exist_ok=True)
        cls.TEMP_DIR.mkdir(exist_ok=True)
    
    @classmethod 
    def validate_poppler_path(cls):
        """Validate if Poppler path exists and contains required files"""
        if not os.path.exists(cls.POPPLER_PATH):
            print(f"Warning: Poppler path not found: {cls.POPPLER_PATH}")
            print("Please install Poppler and update the path in config.py")
            return False
            
        # Check for required Poppler executables
        required_files = ['pdftotext.exe' if os.name == 'nt' else 'pdftotext']
        for file in required_files:
            if not os.path.exists(os.path.join(cls.POPPLER_PATH, file)):
                print(f"Warning: Required Poppler executable not found: {file}")
                print(f"Please ensure Poppler is properly installed at: {cls.POPPLER_PATH}")
                return False
                
        return True