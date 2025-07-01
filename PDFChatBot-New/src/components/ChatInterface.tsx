import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { fetch } from '@tauri-apps/plugin-http';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import { Upload, MessageCircle, Trash2, Send, AlertCircle, XCircle } from 'lucide-react';

// Type definitions
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface DocumentInfo {
    document_id: string;
    filename: string;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [documentId, setDocumentId] = useState<string | null>(null);
    const [currentPdf, setCurrentPdf] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handlePdfUpload = async () => {
        setError(null);
        try {
            const selected = await open({
                multiple: false,
                filters: [{ name: 'PDF', extensions: ['pdf'] }],
            });
            if (typeof selected !== 'string') return;
            setIsLoading(true);
            const filePath = selected;
            const fileName = filePath.split('\\').pop()?.split('/').pop() ?? 'document.pdf';
            const fileContent = await readFile(filePath);
            // File size check (50MB limit)
            const fileSizeMB = fileContent.length / (1024 * 1024);
            if (fileSizeMB > 50) {
                setError(`File too large (${fileSizeMB.toFixed(1)}MB). Maximum allowed is 50MB.`);
                setIsLoading(false);
                return;
            }
            // Get PDF info from backend
            const infoFormData = new FormData();
            infoFormData.append('file', new Blob([fileContent], { type: 'application/pdf' }), fileName);
            const infoResponse = await window.fetch('http://127.0.0.1:8000/pdf-info', {
                method: 'POST',
                body: infoFormData,
            });
            if (infoResponse.ok) {
                const infoData = await infoResponse.json();
                if (infoData.status === 'success') {
                    const pdfInfo = infoData.pdf_info;
                    if (pdfInfo.is_large_file || pdfInfo.page_count > 100) {
                        setMessages([{ 
                            role: 'assistant', 
                            content: `Large file detected (${pdfInfo.file_size_mb.toFixed(1)}MB, ${pdfInfo.page_count} pages). Estimated processing time: ${pdfInfo.estimated_processing_time}. Please be patient...` 
                        }]);
                    }
                } else if (infoData.error) {
                    setError(infoData.error);
                    setIsLoading(false);
                    return;
                }
            }
            // Now upload for processing
            const formData = new FormData();
            formData.append('file', new Blob([fileContent], { type: 'application/pdf' }), fileName);
            const rawResponse = await window.fetch('http://127.0.0.1:8000/extract-text', {
                method: 'POST',
                body: formData,
            });
            const responseData = await rawResponse.json();
            if (rawResponse.ok && responseData.document_id) {
                setDocumentId(responseData.document_id);
                setCurrentPdf(responseData.filename);
                setMessages([{ role: 'assistant', content: `Ready to chat with "${responseData.filename}"!${responseData.file_size_mb ? ` (File size: ${responseData.file_size_mb}MB)` : ''}` }]);
            } else {
                throw new Error(responseData.error || responseData.detail || 'Failed to process PDF.');
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !documentId || isLoading) return;
        const userMessage: ChatMessage = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);
        try {
            console.log('Sending chat message via POST to /chat...');
            const rawResponse = await window.fetch('http://127.0.0.1:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: userMessage.content,
                    document_id: documentId,
                }),
            });
            const responseData = await rawResponse.json();
            console.log('Chat response:', responseData);
            if (rawResponse.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: responseData.response }]);
            } else {
                throw new Error(responseData.detail || 'Server error.');
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const clearSession = () => {
        setMessages([]);
        setInput('');
        setIsLoading(false);
        setDocumentId(null);
        setCurrentPdf(null);
        setError(null);
    };

    return (
        <div className="flex flex-col h-full text-white" style={{background: 'linear-gradient(135deg, #FFB347, #FF9966, #FF7E5F, #FEB47B, #FFD194, #FF6A6A)'}}>
            <div className="p-4 border-b border-white/10 flex justify-between items-center" style={{background: 'linear-gradient(90deg, #FFB347, #FF9966, #FF7E5F, #FEB47B, #FFD194, #FF6A6A)'}}>
                <button
                    onClick={handlePdfUpload}
                    disabled={isLoading && !documentId}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
                    style={{background: 'linear-gradient(90deg, #FFB347, #FF9966, #FF7E5F, #FEB47B, #FFD194, #FF6A6A)', color: '#3d2c1e'}}>
                    <Upload size={18} />
                    {isLoading && !documentId ? 'Processing...' : (currentPdf ? 'Upload New' : 'Upload PDF')}
                </button>
                {currentPdf && <p className="text-sm" style={{color: '#3d2c1e'}}>Chatting with: <span className="font-medium" style={{color: '#3d2c1e'}}>{currentPdf}</span></p>}
                {documentId && <button onClick={clearSession} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{background: 'linear-gradient(90deg, #FF7E5F, #FF6A6A)', color: '#3d2c1e'}}><Trash2 size={16} />Clear</button>}
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {messages.length === 0 && <div className="text-center" style={{color: '#3d2c1e'}}>Upload a PDF to begin.</div>}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}> 
                        {msg.role === 'assistant' && <div className="p-2 rounded-full" style={{background: 'linear-gradient(135deg, #FFB347, #FF9966, #FF7E5F, #FEB47B, #FFD194, #FF6A6A)'}}><MessageCircle className="w-5 h-5" style={{color: '#3d2c1e'}} /></div>}
                        <div
                            className={`max-w-[75%] py-2 px-6 rounded-xl shadow-md ${msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}
                            style={{
                                background: msg.role === 'user' ? 'linear-gradient(90deg, #FF7E5F, #FF6A6A)' : 'linear-gradient(90deg, #FFD194, #FEB47B)',
                                color: '#3d2c1e',
                                borderRadius: '1.5rem',
                                marginBottom: '0.5rem',
                            }}
                        >
                            <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && messages.some(m=>m.role === 'user') && (
                  <div className="flex items-start gap-3">
                     <div className="p-2 rounded-full" style={{background: 'linear-gradient(135deg, #FFB347, #FF9966, #FF7E5F, #FEB47B, #FFD194, #FF6A6A)'}}><MessageCircle className="w-5 h-5" style={{color: '#3d2c1e'}} /></div>
                     <div className="flex items-center gap-2 bg-white/20 p-4 rounded-xl rounded-bl-none" style={{color: '#3d2c1e'}}>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:0.4s]"></div>
                     </div>
                  </div>
                )}
                {error && <div className="flex justify-center"><div className="bg-red-500/20 p-3 rounded-lg flex items-center gap-2"><AlertCircle size={16} />{error}<button onClick={() => setError(null)}><XCircle size={16} /></button></div></div>}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={documentId ? 'Ask anything...' : 'Upload a PDF to start'}
                        disabled={!documentId || isLoading}
                        className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        style={{color: '#3d2c1e', background: 'rgba(255, 236, 217, 0.7)'}}
                    />
                    <button type="submit" disabled={!input.trim()} className="p-3 rounded-lg"
                        style={{background: 'linear-gradient(90deg, #FFB347, #FF9966, #FF7E5F, #FEB47B, #FFD194, #FF6A6A)', color: '#3d2c1e', marginLeft: '-2.5rem', boxShadow: '0 2px 8px #ffb34744'}}>
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
} 