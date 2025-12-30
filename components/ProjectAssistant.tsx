
import React, { useState, useRef, useEffect } from 'react';
import { Code, Terminal, Send, Bot, User, Hash } from 'lucide-react';
import { generateAssistantResponse } from '../services/geminiService';
import { Message } from '../types';

const ProjectAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Ready for high-level project analysis, sir. I have synchronized my neural engine with your latest development repositories. What's the objective?", 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // Prepare history for Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const response = await generateAssistantResponse(currentInput, history);
      const assistantMsg: Message = { 
        role: 'assistant', 
        content: response || "Analysis timed out, sir.", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-full p-8 gap-8">
      {/* Chat Terminal */}
      <div className="flex-1 bg-slate-950/80 border border-cyan-900/50 rounded-3xl flex flex-col overflow-hidden relative">
        <div className="h-14 border-b border-cyan-900/50 flex items-center px-6 gap-3 bg-slate-900/50">
          <Terminal size={18} className="text-cyan-500" />
          <span className="hud-font text-xs uppercase tracking-widest text-cyan-400">Analysis Console</span>
          <div className="ml-auto flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/30"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/30"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/30"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 rounded-lg h-fit ${m.role === 'user' ? 'bg-cyan-500/20' : 'bg-slate-900 border border-cyan-500/30'}`}>
                {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-cyan-600 text-slate-950 rounded-tr-none' 
                  : 'bg-cyan-950/20 text-cyan-100 border border-cyan-900/30 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap">{m.content}</div>
                <div className={`text-[8px] uppercase mt-2 opacity-40 font-bold ${m.role === 'user' ? 'text-slate-950' : 'text-cyan-500'}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-4 animate-pulse">
               <div className="p-2 rounded-lg h-fit bg-slate-900 border border-cyan-500/30">
                 <Bot size={18} />
               </div>
               <div className="bg-cyan-950/20 border border-cyan-900/30 rounded-2xl p-4 text-[10px] uppercase tracking-widest font-bold text-cyan-600">
                  Accessing Cognitive Matrix...
               </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-6 bg-slate-900/50 border-t border-cyan-900/50">
          <div className="flex gap-4">
             <input 
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Enter parameters for analysis..."
               className="flex-1 bg-slate-950 border border-cyan-900/50 rounded-xl px-6 py-3 text-cyan-200 focus:outline-none focus:border-cyan-500/50 placeholder:text-cyan-900"
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             />
             <button 
               onClick={handleSend}
               className="w-12 h-12 flex items-center justify-center bg-cyan-500 text-slate-950 rounded-xl hover:bg-cyan-400 transition-colors"
             >
               <Send size={20} />
             </button>
          </div>
        </div>
      </div>

      {/* Side Project Panel */}
      <div className="w-80 flex flex-col gap-6">
        <div className="bg-cyan-950/5 border border-cyan-900/30 rounded-3xl p-6">
           <h3 className="hud-font text-xs uppercase tracking-widest text-cyan-500 mb-6 flex items-center gap-2">
             <Code size={16} /> Repository Status
           </h3>
           <div className="space-y-4">
             {['Project Mark-I', 'Armor Integration', 'Orbital Defense'].map(p => (
               <div key={p} className="p-3 bg-slate-900 border border-cyan-900/50 rounded-xl flex items-center justify-between group hover:border-cyan-500/50 transition-all cursor-pointer">
                  <span className="text-xs text-cyan-200">{p}</span>
                  <Hash size={12} className="text-cyan-800" />
               </div>
             ))}
           </div>
        </div>
        
        <div className="flex-1 bg-cyan-950/5 border border-cyan-900/30 rounded-3xl p-6 relative">
          <h3 className="hud-font text-xs uppercase tracking-widest text-cyan-500 mb-6">Productivity Reminders</h3>
          <ul className="text-[10px] text-cyan-700 space-y-4 font-bold uppercase tracking-widest">
            <li className="flex items-start gap-3">
              <div className="w-1 h-1 bg-cyan-400 rounded-full mt-1.5"></div>
              Update core firmware at 21:00.
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1 h-1 bg-cyan-400 rounded-full mt-1.5"></div>
              Optimize shield modulation code.
            </li>
            <li className="flex items-start gap-3 opacity-30 line-through">
              <div className="w-1 h-1 bg-cyan-400 rounded-full mt-1.5"></div>
              Drink standard H2O.
            </li>
          </ul>
          
          <div className="absolute bottom-6 left-6 right-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
             <div className="text-[10px] uppercase font-bold text-cyan-500 mb-2">Efficiency Rating</div>
             <div className="text-2xl hud-font text-cyan-400">92.4%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAssistant;
