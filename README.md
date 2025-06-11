# Smart PDF ChatBot

An intelligent chatbot that answers questions from PDF files with images using local AI. This application allows users to upload PDF documents and interact with them through a natural language interface.

## Features

- PDF document upload and processing
- Intelligent question answering using local AI
- Support for PDFs with images
- Real-time chat interface
- Offline operation
- Modern, responsive UI

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Python + FastAPI
- AI: SentenceTransformer for text processing
- UI: Tailwind CSS + Material-UI

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ecnirpleirbag/smart-pdf-chatbot.git
   cd smart-pdf-chatbot
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Development

- Frontend code is in the `src` directory
- Backend code is in the `backend` directory
- Tests are located in `src/test` and `backend/tests`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
