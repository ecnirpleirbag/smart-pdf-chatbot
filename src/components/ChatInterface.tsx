import React, { useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';

interface ChatMessage {
    type: 'user' | 'bot';
    message: string;
    timestamp: Date;
    sources?: any[];
}

interface ChatInterfaceProps {
    messages: ChatMessage[];
    input: string;
    onInputChange: (value: string) => void;
    onSubmit: () => void;
    loading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages,
    input,
    onInputChange,
    onSubmit,
    loading
}) => {
    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)]">
            {/* Messages Container */}
            <div className="flex-grow overflow-y-auto space-y-4 p-4">
                {messages.map((message, index) => (
                    <ChatMessage key={index} {...message} />
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => onInputChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask a question about your PDF..."
                            className="w-full p-4 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500 resize-none"
                            rows={1}
                            disabled={loading}
                        />
                        <button
                            onClick={onSubmit}
                            disabled={!input.trim() || loading}
                            className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all duration-200
                                ${!input.trim() || loading
                                    ? 'text-white/30 cursor-not-allowed'
                                    : 'text-white hover:bg-white/10'
                                }`}
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Send size={20} />
                            )}
                        </button>
                    </div>
                    <p className="mt-2 text-sm text-white/50 text-center">
                        Press Enter to send, Shift + Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
}; 