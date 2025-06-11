import React from 'react';
import { Bot, User, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Source {
    text: string;
    similarity: number;
    metadata: any;
}

interface ChatMessageProps {
    type: 'user' | 'bot';
    message: string;
    timestamp: Date;
    sources?: Source[];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ type, message, timestamp, sources }) => {
    const [showSources, setShowSources] = React.useState(false);

    return (
        <div className={`flex gap-4 p-4 ${type === 'bot' ? 'bg-white/5' : ''} rounded-lg`}>
            <div className="flex-shrink-0">
                {type === 'bot' ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <Bot size={16} className="text-white" />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <User size={16} className="text-white" />
                    </div>
                )}
            </div>
            <div className="flex-grow space-y-2">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-white/90">
                        {type === 'bot' ? 'Assistant' : 'You'}
                    </span>
                    <span className="text-sm text-white/50">
                        {timestamp.toLocaleTimeString()}
                    </span>
                </div>
                <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                        components={{
                            code: ({ className, children, ...props }: any) => {
                                const match = /language-(\w+)/.exec(className || '');
                                return match ? (
                                    <SyntaxHighlighter
                                        style={vscDarkPlus as any}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {message}
                    </ReactMarkdown>
                </div>
                {sources && sources.length > 0 && (
                    <div className="mt-4">
                        <button
                            onClick={() => setShowSources(!showSources)}
                            className="flex items-center gap-2 text-sm text-white/70 hover:text-white/90"
                        >
                            {showSources ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            Sources ({sources.length})
                        </button>
                        {showSources && (
                            <div className="mt-2 space-y-2">
                                {sources.map((source, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-white/5 rounded-lg text-sm"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-white/70">
                                                Source {index + 1}
                                            </span>
                                            <span className="text-white/50">
                                                {Math.round(source.similarity * 100)}% match
                                            </span>
                                        </div>
                                        <p className="text-white/90">{source.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}; 