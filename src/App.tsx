import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Upload, MessageCircle, Trash2, AlertCircle, XCircle } from 'lucide-react';

// Type definitions
interface FileUploadProps {
    onFileSelect: (file: File) => void;
    loading: boolean;
    error: string | null;
}

interface ChatInterfaceProps {
    messages: ChatMessage[];
    input: string;
    onInputChange: (value: string) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    loading: boolean;
}

interface ChatMessage {
    type: 'user' | 'bot';
    message: string;
    timestamp: Date;
    sources?: any[];
}

interface DocumentInfo {
    document_id: string;
    filename: string;
    word_count: number;
    status: string;
}

interface ConnectionStatusProps {
    isConnected: boolean;
    isChecking: boolean;
}

// File Upload Component
const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, loading, error }) => {
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    };
  
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
    };
  
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                onFileSelect(file);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragActive
                        ? 'border-blue-400 bg-blue-500/10'
                        : 'border-white/20 hover:border-white/40'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <Upload className="mx-auto mb-4 text-white/60" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">Upload Your PDF</h3>
                <p className="text-white/60 mb-4">Drag and drop your PDF file here, or click to select</p>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-all duration-200 border border-white/20"
                >
                    Choose PDF File
                </label>
            </div>
            
            {loading && (
                <div className="text-center py-4">
                    <div className="inline-flex items-center gap-3 text-blue-300">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-300"></div>
                        Processing your PDF...
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300">
                    <div className="flex items-center gap-2">
                        <XCircle size={16} />
                        {error}
                    </div>
                </div>
            )}
        </div>
    );
};

// Chat Interface Component
const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, input, onInputChange, onSubmit, loading }) => {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(e);
    };
  
    return (
      <div className="chat-interface">
        <div className="messages">
          {messages.map((msg: ChatMessage, idx: number) => (
            <div key={idx} className={`message ${msg.type === 'user' ? 'user' : 'bot'}`}>
              {msg.message}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>Send</button>
        </form>
      </div>
    );
  };
  

// Fix the ConnectionStatus component
const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, isChecking }) => {
    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isChecking 
                ? 'bg-yellow-500/20 text-yellow-300' 
                : isConnected 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-red-500/20 text-red-300'
        }`}>
            <div className={`w-2 h-2 rounded-full ${
                isChecking 
                    ? 'bg-yellow-300 animate-pulse' 
                    : isConnected 
                        ? 'bg-green-300' 
                        : 'bg-red-300'
            }`} />
            {isChecking ? 'Checking connection...' : (isConnected ? 'Connected' : 'Disconnected')}
        </div>
    );
};
  
function App() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState<string>('');
    const [chatLoading, setChatLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'chat'>('upload');
    const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
    const [checkingConnection, setCheckingConnection] = useState(false);

    // Check backend connection
    const checkBackendConnection = async () => {
        setCheckingConnection(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/health', {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            setBackendConnected(response.ok);
        } catch (e) {
            console.error('Backend connection check failed:', e);
            setBackendConnected(false);
        } finally {
            setCheckingConnection(false);
        }
    };

    // Check connection on mount
    useEffect(() => {
        checkBackendConnection();
    }, []);

    const handleFileSelect = (selectedFile: File) => {
        console.log('📁 File selected:', selectedFile.name, selectedFile.size, 'bytes');
        setFile(selectedFile);
        setError(null);
        setDocumentInfo(null);
        setChatMessages([]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a PDF file first.');
            return;
        }

        console.log('🔄 Starting upload process for:', file.name);
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('📤 Sending request to backend...');
            const response = await fetch('http://127.0.0.1:8000/extract-text', {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            console.log('📥 Response status:', response.status, response.statusText);

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
                console.error('❌ Backend error:', err);
                setError(err.error || `Server error: ${response.status}`);
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log('✅ Backend response data:', data);

            if (!data.document_id) {
                console.error('❌ Missing document_id in response');
                setError('Invalid response: missing document_id');
                return;
            }

            const docInfo = {
                document_id: data.document_id,
                filename: data.filename,
                word_count: data.word_count,
                status: data.status
            };

            console.log('📋 Setting document info:', docInfo);
            setDocumentInfo(docInfo);
            setBackendConnected(true);

            setChatMessages([{
                type: 'bot',
                message: `Document "${data.filename}" processed successfully! You can now ask questions about it.`,
                timestamp: new Date()
            }]);

            setActiveTab('chat');
        } catch (e: any) {
            console.error('🚨 Network error:', e);
            if (e.name === 'TimeoutError') {
                setError('Request timed out. Please try again.');
            } else if (e.name === 'AbortError') {
                setError('Request was cancelled.');
            } else {
                setError('Network error: Unable to connect to backend server. Make sure it\'s running on http://127.0.0.1:8000');
            }
            setBackendConnected(false);
        } finally {
            setLoading(false);
        }
    };

    const handleChatSubmit = async () => {
        if (!chatInput.trim() || !documentInfo) return;

        const query = chatInput.trim();
        const userMessage: ChatMessage = {
            type: 'user',
            message: query,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setChatLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query,
                    document_id: documentInfo.document_id
                }),
                signal: AbortSignal.timeout(30000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const botMessage: ChatMessage = {
                type: 'bot',
                message: data.response || 'No response received',
                timestamp: new Date(),
                sources: data.sources
            };

            setChatMessages(prev => [...prev, botMessage]);
        } catch (e: any) {
            console.error('🚨 Chat error:', e);
            const errorMessage: ChatMessage = {
                type: 'bot',
                message: `Error: ${e.message}`,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setChatLoading(false);
        }
    };

    const clearChat = () => {
        setChatMessages([]);
        setDocumentInfo(null);
        setFile(null);
        setError(null);
        setActiveTab('upload');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            PDF ChatBot
                        </h1>
                        {documentInfo && (
                            <button
                                onClick={clearChat}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200 border border-red-500/30"
                            >
                                <Trash2 size={16} />
                                Clear Session
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Connection Status */}
                <ConnectionStatus 
                    isConnected={backendConnected ?? false} 
                    isChecking={checkingConnection}
                />

                {/* Debug Info Panel */}
                <div className="mb-4 p-4 bg-gray-800/50 rounded-lg text-sm text-gray-300">
                    <div className="font-bold mb-2">Debug Info:</div>
                    <div>File: {file ? `${file.name} (${file.size} bytes)` : 'None'}</div>
                    <div>Document ID: {documentInfo?.document_id || 'None'}</div>
                    <div>Status: {documentInfo?.status || 'No document'}</div>
                    <div>Messages: {chatMessages.length}</div>
                    <div>Backend URL: http://127.0.0.1:8000</div>
                    <button
                        onClick={checkBackendConnection}
                        className="mt-2 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs"
                    >
                        Test Connection
                    </button>
                </div>

                {/* Backend Connection Warning */}
                {backendConnected === false && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-red-400 mt-0.5" size={20} />
                            <div>
                                <h3 className="text-red-300 font-semibold mb-2">Backend Server Not Available</h3>
                                <p className="text-red-200 text-sm mb-3">
                                    Cannot connect to the backend server at http://127.0.0.1:8000
                                </p>
                                <div className="text-red-200 text-sm space-y-1">
                                    <p><strong>Troubleshooting steps:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>Make sure your Python backend server is running</li>
                                        <li>Check if it's listening on port 8000</li>
                                        <li>Verify CORS is enabled for your frontend</li>
                                        <li>Check firewall settings</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-2 border border-white/10">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                            activeTab === 'upload'
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <Upload size={18} />
                        Upload PDF
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        disabled={!documentInfo}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                            activeTab === 'chat' && documentInfo
                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                                : documentInfo
                                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                                    : 'text-white/30 cursor-not-allowed'
                        }`}
                    >
                        <MessageCircle size={18} />
                        Chat with PDF
                        {documentInfo && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                Ready
                            </span>
                        )}
                    </button>
                </div>

                {/* Main Content */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                    {activeTab === 'upload' ? (
                        <div className="p-8">
                            <FileUpload
                                onFileSelect={handleFileSelect}
                                loading={loading}
                                error={error}
                            />
                            {file && !loading && (
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={handleUpload}
                                        disabled={backendConnected === false}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                                    >
                                        Process PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <ChatInterface
                            messages={chatMessages}
                            input={chatInput}
                            onInputChange={setChatInput}
                            onSubmit={handleChatSubmit}
                            loading={chatLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;