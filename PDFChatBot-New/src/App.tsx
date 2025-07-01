import React from 'react';
import { ChatInterface } from './components/ChatInterface';
import './App.css';

function App() {
  return (
    <div className="flex flex-col h-screen font-sans" style={{background: 'linear-gradient(135deg, #FFB347, #FF9966, #FF7E5F, #FEB47B, #FFD194, #FF6A6A)'}}>
      <header className="py-4 shadow-lg flex-shrink-0" style={{background: 'linear-gradient(90deg, #FFB347, #FF9966, #FF7E5F, #FEB47B, #FFD194, #FF6A6A)'}}>
        <h1 className="text-4xl font-extrabold text-center" style={{color: '#3d2c1e', textShadow: '1px 1px 8px #fff8, 0 2px 8px #ffb34788'}}>
          PDF ChatBot
        </h1>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-5xl h-full rounded-2xl shadow-2xl border border-white/10 flex flex-col" style={{background: 'rgba(0,0,0,0.10)'}}>
          <ChatInterface />
        </div>
      </main>

      <footer className="text-center p-3 text-sm flex-shrink-0" style={{background: 'linear-gradient(90deg, #FFB347, #FF9966, #FF7E5F, #FEB47B, #FFD194, #FF6A6A)', color: '#3d2c1e', textShadow: '1px 1px 6px #fff8'}}>
        <p>&copy; {new Date().getFullYear()} Gabriel Prince. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;
