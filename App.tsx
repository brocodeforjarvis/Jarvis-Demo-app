
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Mic, MicOff, Cloud, Camera, Palette, Terminal, 
  Cpu, Activity, Zap, ShieldCheck, Code, 
  Maximize2, RefreshCw, Loader2, Info
} from 'lucide-react';
import { 
  connectJarvisLive, decode, decodeAudioData, createPcmBlob 
} from './services/liveService';
import { LiveServerMessage } from '@google/genai';
import { generateAssistantResponse, generateAIImage } from './services/geminiService';

const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("System Ready");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // HUD Data
  const [telemetry, setTelemetry] = useState({ cpu: 12, memory: 44, link: 98, temp: 42 });
  const [workspace, setWorkspace] = useState<{
    type: 'code' | 'weather' | 'image' | 'system' | 'loading';
    title: string;
    content?: string;
    data?: any;
    url?: string;
  }>({ type: 'system', title: 'Global Diagnostics' });

  // Voice Interaction State
  const [transcript, setTranscript] = useState("");
  const [jarvisResponse, setJarvisResponse] = useState("");

  // Refs for low-latency audio and to prevent lag
  const sessionPromiseRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  
  const transcriptRef = useRef("");
  const responseBufferRef = useRef("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTelemetry(prev => ({
        cpu: Math.floor(5 + Math.random() * 10),
        memory: Math.floor(40 + Math.random() * 5),
        link: Math.floor(98 + Math.random() * 2),
        temp: 38 + Math.floor(Math.random() * 6)
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleIntents = useCallback(async (text: string) => {
    const t = text.toLowerCase();
    
    // Hindi keywords support
    const isCoding = t.includes("code") || t.includes("function") || t.includes("debug") || t.includes("likho") || t.includes("program");
    const isWeather = t.includes("weather") || t.includes("atmosphere") || t.includes("mausam");
    const isImage = t.includes("generate") || t.includes("image") || t.includes("photo") || t.includes("banao");

    if (isCoding) {
      setWorkspace({ type: 'loading', title: 'Neural Code Analysis' });
      const codeAdvice = await generateAssistantResponse(`Provide advanced coding help for: ${text}. Answer in the same language (English or Hindi) used in the request.`);
      setWorkspace({ type: 'code', title: 'Optimization Report', content: codeAdvice || '// Connection timeout, Sir.' });
    } 
    else if (isWeather) {
      setWorkspace({ type: 'loading', title: 'Atmospheric Scan' });
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.20&current_weather=true`);
        const data = await res.json();
        setWorkspace({ type: 'weather', title: 'Local Metrics', data: { temp: data.current_weather.temperature, wind: data.current_weather.windspeed } });
      } catch {
        setWorkspace({ type: 'weather', title: 'Local Metrics', data: { temp: 24, wind: 8 } });
      }
    }
    else if (isImage) {
      setWorkspace({ type: 'loading', title: 'Visual Synthesis' });
      const img = await generateAIImage(text);
      if (img) setWorkspace({ type: 'image', title: 'Synthetic Projection', url: img });
      else setWorkspace({ type: 'system', title: 'Synthesis Offline' });
    }
  }, []);

  const startJarvis = async () => {
    if (isActive) return;
    try {
      setStatus("Syncing Neural Link...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

      const callbacks = {
        onopen: () => {
          setStatus("Secure Link Established");
          setIsActive(true);
          
          if (inputAudioContextRef.current) {
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromiseRef.current?.then((session: any) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          }
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text;
            transcriptRef.current = text;
            setTranscript(text);
          }
          if (message.serverContent?.outputTranscription) {
            responseBufferRef.current += message.serverContent.outputTranscription.text;
            setJarvisResponse(responseBufferRef.current);
          }
          if (message.serverContent?.turnComplete) {
            handleIntents(transcriptRef.current);
            responseBufferRef.current = "";
          }

          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio && outputAudioContextRef.current) {
            const ctx = outputAudioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const sourceNode = ctx.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(ctx.destination);
            sourceNode.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(sourceNode);
            sourceNode.onended = () => sourcesRef.current.delete(sourceNode);
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            responseBufferRef.current = "";
            setJarvisResponse("");
          }
        },
        onerror: (e: ErrorEvent) => {
          console.error("Core Error:", e);
          setStatus("Link Lost");
        },
        onclose: () => {
          setIsActive(false);
          setStatus("Offline");
        }
      };

      sessionPromiseRef.current = connectJarvisLive(callbacks);
    } catch (err) {
      console.error(err);
      setStatus("Hardware Access Error");
    }
  };

  return (
    <div className="h-screen w-screen bg-[#01040a] text-cyan-400 overflow-hidden select-none flex flex-col relative">
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_#083344_0%,_transparent_75%)]"></div>
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <header className="h-14 border-b border-cyan-900/40 bg-slate-950/90 backdrop-blur-xl flex items-center justify-between px-10 z-50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse' : 'bg-red-600 shadow-[0_0_12px_#dc2626]'}`}></div>
            <span className="hud-font text-[11px] uppercase tracking-[0.3em] font-black">JARVIS // V4.1_PRO</span>
          </div>
          <div className="h-4 w-px bg-cyan-900/50"></div>
          <span className="text-[10px] text-cyan-600 uppercase font-black tracking-widest">{status}</span>
        </div>

        <div className="flex items-center gap-10">
           <div className="text-right">
             <div className="hud-font text-xl font-black text-cyan-50">
               {currentTime.toLocaleTimeString([], { hour12: false })}
             </div>
             <div className="text-[8px] uppercase text-cyan-800 tracking-[0.4em] font-bold">
               LOC: MALIBU_HQ // {currentTime.toLocaleDateString()}
             </div>
           </div>
           <div className="flex flex-col gap-1 w-32">
              <div className="flex justify-between text-[7px] font-black text-cyan-900 uppercase">
                <span>Sync</span>
                <span>{telemetry.link}%</span>
              </div>
              <div className="w-full h-1 bg-cyan-950 rounded-full overflow-hidden">
                 <div className="h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]" style={{ width: `${telemetry.link}%` }}></div>
              </div>
           </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-12 gap-6 relative z-10">
        <aside className="col-span-3 flex flex-col gap-6">
          <div className="bg-cyan-950/5 border border-cyan-900/30 rounded-[2rem] p-6 flex flex-col gap-5">
             <h3 className="hud-font text-[10px] uppercase tracking-[0.2em] text-cyan-700 border-b border-cyan-900/30 pb-3 flex items-center gap-2">
               <Cpu size={14} /> Neural Telemetry
             </h3>
             <Metric label="CPU LOAD" value={`${telemetry.cpu}%`} percent={telemetry.cpu} color="bg-cyan-400" />
             <Metric label="MEMORY" value={`${telemetry.memory}%`} percent={telemetry.memory} color="bg-purple-500" />
             <Metric label="TEMP" value={`${telemetry.temp}°C`} percent={telemetry.temp} color="bg-red-500" />
          </div>

          <div className="flex-1 bg-cyan-950/5 border border-cyan-900/30 rounded-[2rem] p-6 relative overflow-hidden flex flex-col group hover:border-cyan-500/40 transition-all">
             <h3 className="hud-font text-[10px] uppercase tracking-[0.2em] text-cyan-700 mb-6 border-b border-cyan-900/30 pb-3 flex items-center gap-2">
               <ShieldCheck size={14} /> Security Protocol
             </h3>
             <ul className="space-y-4 flex-1">
                <SecurityItem label="Encryption" val="Secure" active />
                <SecurityItem label="Hindi/Eng Filter" val="Active" active />
                <SecurityItem label="Neural Sync" val="Verified" active />
                <SecurityItem label="Ghost State" val="Standby" active={false} />
             </ul>
             <div className="mt-auto pt-4 border-t border-cyan-900/20 opacity-30">
                <div className="text-[8px] uppercase font-black text-cyan-900 mb-2">Neural Activity</div>
                <div className="flex gap-1 h-10 items-end">
                   {[...Array(12)].map((_, i) => (
                     <div key={i} className="flex-1 bg-cyan-500 rounded-t-sm" style={{ height: `${20 + Math.random() * 80}%` }}></div>
                   ))}
                </div>
             </div>
          </div>
        </aside>

        <section className="col-span-6 flex flex-col gap-6">
          <div className="flex-1 bg-cyan-950/5 border border-cyan-900/20 rounded-[4rem] relative flex flex-col items-center justify-center overflow-hidden">
            <div className={`relative cursor-pointer transition-all duration-700 ${isActive ? 'scale-105 opacity-100' : 'scale-95 opacity-50 hover:opacity-70'}`} onClick={isActive ? undefined : startJarvis}>
               <div className="absolute inset-0 border-2 border-dashed border-cyan-500/10 rounded-full animate-[spin_40s_linear_infinite]"></div>
               <div className="absolute inset-8 border border-cyan-400/20 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
               
               <div className={`w-44 h-44 rounded-full bg-[#0a1a2f] flex flex-col items-center justify-center border-2 border-cyan-500/40 shadow-[0_0_100px_rgba(34,211,238,0.1)] transition-all ${isActive && transcript ? 'reactor-pulse' : ''}`}>
                 <div className="hud-font text-5xl font-black text-cyan-400 tracking-tighter drop-shadow-[0_0_15px_#22d3ee]">
                    {isActive ? "J" : "ARC"}
                 </div>
                 <div className="text-[7px] uppercase font-black text-cyan-700 mt-2 tracking-[0.5em]">
                   {isActive ? "ACTIVE" : "START"}
                 </div>
               </div>
            </div>

            <div className="mt-16 w-full px-16 text-center">
               <div className="h-6 text-[11px] text-cyan-700 font-bold uppercase tracking-[0.3em] mb-4 overflow-hidden">
                 {transcript ? `> ANALYZING: ${transcript.toUpperCase()}` : "Awaiting Command..."}
               </div>
               <div className="min-h-[100px] text-lg font-medium text-cyan-50 max-w-xl mx-auto leading-relaxed tracking-tight">
                 {jarvisResponse || "I am JARVIS. Core systems are operational, Sir. How may I assist?"}
               </div>
            </div>

            {!isActive && (
              <button onClick={startJarvis} className="mt-10 px-12 py-4 border-2 border-cyan-500/50 text-cyan-400 hud-font text-xs font-black rounded-full hover:bg-cyan-500 hover:text-slate-950 transition-all duration-500 uppercase tracking-widest">
                Engage Core
              </button>
            )}
          </div>

          <div className="h-28 bg-slate-950/40 border border-cyan-900/30 rounded-[2.5rem] px-10 flex items-center justify-between backdrop-blur-md">
             <div className="flex gap-8">
               <ControlIcon icon={<Code />} active={workspace.type === 'code'} />
               <ControlIcon icon={<Palette />} active={workspace.type === 'image'} />
               <ControlIcon icon={<Cloud />} active={workspace.type === 'weather'} />
               <ControlIcon icon={<Terminal />} active={workspace.type === 'system'} />
             </div>
             <div className="flex-1 flex flex-col gap-2 ml-12">
               <div className="flex justify-between text-[8px] uppercase font-black text-cyan-800 tracking-widest">
                  <span>Voice Amplitude</span>
                  <span>SYNC OK</span>
               </div>
               <div className="flex gap-0.5 items-center h-4">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className={`flex-1 ${isActive ? 'bg-cyan-500' : 'bg-cyan-950/30'} rounded-sm`} style={{ height: `${isActive ? 20 + Math.random() * 80 : 10}%` }}></div>
                  ))}
               </div>
             </div>
          </div>
        </section>

        <section className="col-span-3 flex flex-col gap-6">
          <div className="flex-1 bg-cyan-950/5 border border-cyan-900/30 rounded-[2.5rem] flex flex-col overflow-hidden backdrop-blur-sm transition-all hover:border-cyan-500/30">
             <div className="h-14 border-b border-cyan-900/40 flex items-center px-8 justify-between bg-slate-900/40">
                <span className="hud-font text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                  {workspace.title}
                </span>
                <Maximize2 size={12} className="text-cyan-800" />
             </div>
             
             <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
                {workspace.type === 'loading' ? (
                  <div className="flex flex-col items-center justify-center h-full gap-6 opacity-40">
                    <Loader2 size={40} className="animate-spin" />
                    <div className="hud-font text-[8px] uppercase tracking-widest">Processing Data...</div>
                  </div>
                ) : workspace.type === 'code' ? (
                  <div className="space-y-4">
                     <div className="code-block text-xs whitespace-pre-wrap animate-in fade-in duration-700">
                        {workspace.content}
                     </div>
                     <p className="text-[10px] text-cyan-700 font-bold uppercase tracking-tight">Code Refactoring verified, Sir.</p>
                  </div>
                ) : workspace.type === 'weather' ? (
                  <div className="flex flex-col items-center justify-center h-full gap-6 animate-in zoom-in duration-500">
                     <Cloud size={60} className="text-cyan-400" />
                     <div className="text-center">
                       <div className="text-5xl hud-font font-black text-cyan-50">{workspace.data?.temp}°C</div>
                       <div className="text-[10px] uppercase font-bold text-cyan-600 mt-2 tracking-[0.4em]">Local Atmosphere</div>
                     </div>
                  </div>
                ) : workspace.type === 'image' ? (
                  <div className="h-full flex flex-col items-center justify-center animate-in slide-in-from-right duration-700">
                     <img src={workspace.url} className="rounded-2xl border border-cyan-500/30 shadow-2xl grayscale-[0.1]" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-20 text-center gap-4">
                    <Terminal size={48} />
                    <p className="hud-font text-[9px] uppercase tracking-[0.3em]">Awaiting Uplink...</p>
                  </div>
                )}
             </div>
          </div>

          <div className="h-52 bg-cyan-950/5 border border-cyan-900/30 rounded-[2.5rem] p-8 backdrop-blur-sm overflow-hidden group">
             <div className="hud-font text-[9px] uppercase tracking-[0.3em] text-cyan-700 mb-6 flex justify-between">
               Neural Logic
               <span className="text-cyan-900 text-[8px]">BUFFER: 2.1ms</span>
             </div>
             <div className="flex items-end gap-[2px] h-20">
               {[...Array(24)].map((_, i) => (
                 <div key={i} className="flex-1 bg-cyan-500/20 group-hover:bg-cyan-500/40 rounded-t-sm transition-all" style={{ height: `${10 + Math.random() * 90}%` }}></div>
               ))}
             </div>
             <div className="mt-6 text-[8px] font-black text-cyan-900 uppercase tracking-widest flex justify-between">
                <span>Eng/Hin Sync: OK</span>
                <span>Protocols: Nominal</span>
             </div>
          </div>
        </section>
      </main>

      <footer className="h-10 border-t border-cyan-900/30 flex items-center justify-between px-10 bg-slate-950/90 text-[9px] tracking-[0.5em] uppercase font-black text-cyan-900 backdrop-blur-xl z-50">
        <div className="flex gap-12">
           <span>STARK_INDUSTRIES_V4.1</span>
           <span className="text-cyan-950">LAT: 28.61°N, LONG: 77.20°E</span>
        </div>
        <div className="flex gap-12">
           <span className="animate-pulse">Link Status: Stable</span>
           <span className="text-cyan-950">Secure Terminal // 2025</span>
        </div>
      </footer>
    </div>
  );
};

const Metric = ({ label, value, percent, color }: { label: string, value: string, percent: number, color: string }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em]">
       <span className="text-cyan-800">{label}</span>
       <span className="text-cyan-200">{value}</span>
    </div>
    <div className="h-1 w-full bg-cyan-950/40 rounded-full overflow-hidden">
       <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

const SecurityItem = ({ label, val, active }: { label: string, val: string, active: boolean }) => (
  <li className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-1 h-1 rounded-full ${active ? 'bg-cyan-400' : 'bg-cyan-900'}`}></div>
      <span className="text-[10px] uppercase font-black text-cyan-800 tracking-widest">{label}</span>
    </div>
    <span className="text-[9px] font-bold text-cyan-300/40 uppercase">{val}</span>
  </li>
);

const ControlIcon = ({ icon, active }: { icon: any, active: boolean }) => (
  <div className={`p-4 rounded-2xl border transition-all duration-500 ${
    active ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-slate-950/50 border-cyan-900/50 text-cyan-900'
  }`}>
    {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
  </div>
);

export default App;
