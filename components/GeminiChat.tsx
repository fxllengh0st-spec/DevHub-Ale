import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Sparkles, User } from 'lucide-react';
import { getChatResponseStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GenerateContentResponse } from '@google/genai';

export const GeminiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your AI Portfolio Navigator. I can help you find specific projects, explain the tech stack used, or summarize the developer's expertise. What would you like to explore?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      const stream = await getChatResponseStream(userMsg.text);
      
      let fullText = '';
      
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text || '';
        fullText += textChunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId ? { ...msg, text: fullText } : msg
        ));
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "System overload. I'm having trouble reaching the neural network. Please verify API configuration.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Premium Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary hover:bg-indigo-600 text-white shadow-2xl shadow-primary/40 flex items-center justify-center transition-all duration-500 z-40 hover:scale-110 active:scale-90 ${isOpen ? 'scale-0 opacity-0 rotate-90' : 'scale-100 opacity-100 rotate-0'}`}
      >
        <div className="relative">
          <MessageSquare size={28} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-primary animate-pulse"></div>
        </div>
      </button>

      {/* Chat Architecture */}
      <div 
        className={`fixed bottom-8 right-8 w-[92vw] md:w-[420px] h-[600px] bg-slate-950 border border-slate-800 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-50 flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) origin-bottom-right overflow-hidden ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-20 pointer-events-none'}`}
      >
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-slate-900 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Portfolio Brain</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Neural Engine v2.5</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-slate-400 hover:text-white transition-all hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-900/30 text-primary' : 'bg-slate-900 text-slate-400'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm shadow-lg shadow-primary/10'
                    : 'bg-slate-900 text-slate-300 rounded-tl-sm border border-slate-800'
                }`}
              >
                {msg.text}
                {msg.text === '' && <Loader2 size={16} className="animate-spin text-primary" />}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Interface */}
        <div className="p-6 border-t border-slate-900 bg-slate-900/20 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query project data..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-5 pr-14 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2.5 bg-primary hover:bg-indigo-600 text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all active:scale-90"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[9px] text-center mt-3 text-slate-600 font-bold uppercase tracking-widest">Powered by Google Gemini AI Engine</p>
        </div>
      </div>
    </>
  );
};