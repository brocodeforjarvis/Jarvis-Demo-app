
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, History } from 'lucide-react';
import { generateAssistantResponse } from '../services/geminiService';

const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Standing by, sir.");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        setTranscript(resultTranscript);
        
        if (event.results[current].isFinal) {
          handleCommand(resultTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // JARVIS Voice Settings (Approximate)
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      utterance.volume = 1;
      // Try to find a British voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes('en-GB')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCommand = async (command: string) => {
    setIsProcessing(true);
    setResponse("Analyzing input...");
    
    try {
      const lowerCommand = command.toLowerCase();

      // Core Commands
      if (lowerCommand.includes("time")) {
        const timeStr = new Date().toLocaleTimeString();
        const reply = `The current time is ${timeStr}, sir.`;
        setResponse(reply);
        speak(reply);
      } else if (lowerCommand.includes("date")) {
        const dateStr = new Date().toLocaleDateString();
        const reply = `Today is ${dateStr}.`;
        setResponse(reply);
        speak(reply);
      } else if (lowerCommand.includes("search for") || lowerCommand.includes("google")) {
        const query = lowerCommand.replace(/search for|google/g, "").trim();
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        const reply = `Searching the global data stream for ${query}.`;
        setResponse(reply);
        speak(reply);
      } else if (lowerCommand.includes("open youtube")) {
        window.open('https://youtube.com', '_blank');
        speak("Accessing global media archives.");
      } else {
        // Fallback to Gemini
        const aiResponse = await generateAssistantResponse(command);
        setResponse(aiResponse || "I encountered an error in my logic, sir.");
        speak(aiResponse || "I'm having trouble connecting to my cognitive matrix.");
      }
    } catch (error) {
      setResponse("System failure in response module.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsListening(true);
      speak("I am listening, sir.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-full max-w-2xl bg-cyan-950/10 border border-cyan-900/40 rounded-3xl p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
        
        <h2 className="hud-font text-2xl mb-8 tracking-[0.2em] uppercase text-cyan-500">Voice Protocol</h2>
        
        {/* Waveform Visualization */}
        <div className="flex items-end justify-center gap-1 h-32 mb-12">
          {Array.from({ length: 40 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-1 rounded-full bg-cyan-400 transition-all duration-75 ${
                isListening ? 'animate-bounce' : 'opacity-20'
              }`}
              style={{ 
                height: isListening ? `${20 + Math.random() * 80}%` : '8px',
                animationDelay: `${i * 0.05}s`
              }}
            ></div>
          ))}
        </div>

        <div className="mb-12 min-h-[100px] flex flex-col justify-center">
          {transcript && (
            <div className="text-cyan-600 italic text-sm mb-4">"{transcript}"</div>
          )}
          <div className={`text-xl font-medium ${isProcessing ? 'animate-pulse' : ''}`}>
            {response}
          </div>
        </div>

        <button 
          onClick={toggleListening}
          className={`relative group w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isListening 
              ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
              : 'bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.4)]'
          } border-2`}
        >
          {isListening ? (
            <MicOff className="text-red-400" size={40} />
          ) : (
            <Mic className="text-cyan-400" size={40} />
          )}
          
          <div className={`absolute -inset-4 border border-cyan-500/20 rounded-full ${isListening ? 'animate-ping' : ''}`}></div>
        </button>

        <p className="mt-8 text-[10px] uppercase tracking-widest text-cyan-700">
          {isListening ? "RECORDING..." : "VOICE LINK READY"}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-2xl">
        <div className="bg-cyan-950/5 border border-cyan-900/30 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
             <Volume2 size={16} className="text-cyan-600" />
             <span className="text-[10px] uppercase font-bold text-cyan-600">Output Gain</span>
          </div>
          <div className="h-1 bg-cyan-900 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 w-3/4"></div>
          </div>
        </div>
        <div className="bg-cyan-950/5 border border-cyan-900/30 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
             <History size={16} className="text-cyan-600" />
             <span className="text-[10px] uppercase font-bold text-cyan-600">Session Log</span>
          </div>
          <div className="text-[10px] text-cyan-800">12 Command Cycles Logged</div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
