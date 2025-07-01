import React, { useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/dialog'
import { readBinaryFile } from '@tauri-apps/api/fs'
import { BaseDirectory } from '@tauri-apps/api/fs'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function App() {
  const [pdfPath, setPdfPath] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'PDF',
          extensions: ['pdf']
        }]
      })

      if (selected) {
        const filePath = selected as string
        const fileContent = await readBinaryFile(filePath)
        const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileContent)))

        const result = await invoke('process_pdf', { 
          pdfContent: base64Content,
          pdfPath: filePath
        })

        setPdfPath(filePath)
        setMessages([{
          role: 'assistant',
          content: 'PDF uploaded successfully! You can now ask questions about it.'
        }])
      }
    } catch (error) {
      console.error('Error uploading PDF:', error)
      setMessages([{
        role: 'assistant',
        content: 'Error uploading PDF. Please try again.'
      }])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !pdfPath) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await invoke('chat_with_pdf', {
        message: userMessage,
        pdfPath: pdfPath
      })

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response as string 
      }])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error processing your message. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
      <main className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 to-blue-900 p-4">
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
          <h1 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            PDF ChatBot
          </h1>
          
          {!pdfPath && (
            <div className="flex-1 flex justify-center items-center mb-8">
              <button
                onClick={handleFileSelect}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
              >
                Select PDF to Start Chatting
              </button>
            </div>
          )}

          {pdfPath && (
            <div className="flex-1 flex flex-col bg-black bg-opacity-20 rounded-lg shadow-2xl overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-4 rounded-xl ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-700 text-gray-200 rounded-bl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-center items-center gap-2 text-gray-400">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    <span>Processing...</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex gap-4 p-4 bg-black bg-opacity-20 border-t border-gray-700">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about your PDF..."
                  className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!pdfPath || isLoading}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors duration-300"
                  disabled={!pdfPath || isLoading}
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      <footer className="text-center p-4 bg-gray-900 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Gabriel Prince. All Rights Reserved.</p>
      </footer>
    </div>
  )
}

export default App 