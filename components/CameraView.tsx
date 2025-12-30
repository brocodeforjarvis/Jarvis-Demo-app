
import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Maximize2, Crosshair } from 'lucide-react';

const CameraView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [scanStatus, setScanStatus] = useState("Standby");

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
          setScanStatus("Analyzing Optics...");
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setScanStatus("Optics Offline");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-8 h-full flex flex-col gap-6">
      <div className="flex-1 bg-slate-900 border border-cyan-900/50 rounded-3xl relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
        {/* Scanning Overlays */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="scanner-line"></div>
          
          {/* HUD Brackets */}
          <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-cyan-400"></div>
          <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-cyan-400"></div>
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-cyan-400"></div>
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-cyan-400"></div>
          
          {/* Central Reticle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-48 h-48 border border-cyan-500/20 rounded-full">
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <Crosshair size={48} className="text-cyan-400 animate-pulse" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 hud-font text-[8px] uppercase font-bold text-cyan-400">
                Target Lock: 0.00ms
              </div>
            </div>
          </div>

          {/* Side Telemetry */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-16 h-1 bg-cyan-900 rounded-full">
                    <div className="h-full bg-cyan-500 animate-pulse" style={{ width: `${Math.random() * 100}%` }}></div>
                 </div>
                 <span className="text-[8px] text-cyan-400 font-bold">PT-{i}</span>
               </div>
             ))}
          </div>

          {/* Status Label */}
          <div className="absolute bottom-12 left-12 flex items-center gap-4 bg-slate-950/80 p-4 border border-cyan-500/30 backdrop-blur-md rounded-xl">
             <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-cyan-500 animate-pulse shadow-[0_0_10px_#22d3ee]' : 'bg-red-500'}`}></div>
             <div>
               <div className="hud-font text-[10px] uppercase font-bold text-cyan-400 leading-none mb-1">{scanStatus}</div>
               <div className="text-[8px] uppercase tracking-widest text-cyan-700">Facial Rec: Enabled</div>
             </div>
          </div>
        </div>

        {/* Video Feed */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover filter brightness-110 contrast-125 grayscale-[0.2] hue-rotate-[10deg]"
        />
        
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
             <div className="text-center">
               <Camera size={64} className="mx-auto mb-4 text-cyan-900" />
               <p className="hud-font text-cyan-700 uppercase tracking-widest">Awaiting Authorization...</p>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <ControlBtn icon={<RefreshCw size={18} />} label="Toggle Optics" />
        <ControlBtn icon={<Maximize2 size={18} />} label="Full Spectrum" />
        <ControlBtn icon={<Camera size={18} />} label="Data Snapshot" />
        <div className="bg-cyan-500 flex items-center justify-center rounded-xl hud-font text-[10px] font-black text-slate-950 uppercase cursor-pointer hover:bg-cyan-400 transition-colors">
          Initialize Combat Mode
        </div>
      </div>
    </div>
  );
};

const ControlBtn = ({ icon, label }: { icon: any, label: string }) => (
  <button className="flex flex-col items-center justify-center p-4 bg-cyan-950/5 border border-cyan-900/30 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-cyan-400">
    {icon}
    <span className="text-[8px] uppercase tracking-widest font-bold mt-2">{label}</span>
  </button>
);

export default CameraView;
