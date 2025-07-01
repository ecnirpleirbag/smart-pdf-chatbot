import React, { useState, useRef, useEffect } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { readBinaryFile } from '@tauri-apps/api/fs';
import { fetch, Body } from '@tauri-apps/api/http';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPdf, setCurrentPdf] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePdfUpload = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      });

      if (selected) {
        setIsLoading(true);
        const filePath = selected as string;
        const fileName = filePath.split(/[\\/]/).pop() || 'document.pdf';
        const fileContent = await readBinaryFile(filePath);

        // Convert to Blob for FormData
        const blob = new Blob([new Uint8Array(fileContent)], { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('file', blob, fileName);

        // Upload to FastAPI backend
        const response = await fetch('http://localhost:8000/extract-text', {
          method: 'POST',
          body: Body.form(formData),
        });
        
        const responseData = response.data as any;

        if (response.ok && responseData && responseData.document_id) {
          setDocumentId(responseData.document_id);
          setCurrentPdf(fileName);
          setMessages([{
            role: 'assistant',
            content: 'PDF uploaded and processed! You can now ask questions about it.'
          }]);
        } else {
          setMessages([{
            role: 'assistant',
            content: 'Error: Could not process PDF. Please try again.'
          }]);
        }
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setMessages([{
        role: 'assistant',
        content: 'Error uploading PDF. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !documentId) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        timeout: 300000, // 5 minutes
        body: Body.json({
          query: userMessage,
          document_id: documentId
        })
      });

      const responseData = response.data as any;

      if (response.ok && responseData) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: responseData.response || 'No response from backend.'
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${responseData?.detail || 'An unknown error occurred.'}`
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* PDF Upload Section */}
      <div className="p-4 border-b">
        <button
          onClick={handlePdfUpload}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Uploading...' : 'Upload PDF'}
        </button>
        {currentPdf && (
          <span className="ml-4 text-gray-600">
            Current PDF: {currentPdf}
          </span>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="p-4 border-t">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question about your PDF..."
            disabled={!documentId || isLoading}
            className="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={!documentId || !input.trim() || isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
} 