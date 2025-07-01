# PDF ChatBot v1.0.0

## Features
- Desktop application built with Tauri
- PDF document processing and chat
- OCR text extraction
- Semantic search using SentenceTransformer
- Modern UI with Tailwind CSS
- Cross-platform support (Windows, macOS, Linux)

## Installation
1. Download the installer for your operating system:
   - Windows: `PDFChatBot-1.0.0-x64-setup.exe`
   - macOS: `PDFChatBot-1.0.0-x64.dmg`
   - Linux: `PDFChatBot-1.0.0-x86_64.AppImage` or `PDFChatBot-1.0.0-amd64.deb`

2. Install and run the application:
   - Windows: Run the .exe installer
   - macOS: Open the .dmg file and drag to Applications
   - Linux: Make AppImage executable or install .deb package

## Changes
- Initial release of the desktop application
- Automatic backend server startup
- PDF processing and chat functionality
- Modern user interface
- Cross-platform support

## System Requirements
- Windows 10/11, macOS 10.15+, or Linux
- 4GB RAM minimum
- 500MB free disk space

## Development

For developers interested in contributing to the project:

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Rust and Cargo (for Tauri)
- Tesseract OCR
- Poppler (for PDF processing)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/PDFChatBot.git
cd PDFChatBot
```

2. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

3. Install frontend dependencies:
```bash
cd PDFChatBot
npm install
```

4. Start the development servers:
```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 - Frontend
cd PDFChatBot
npm run tauri dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
