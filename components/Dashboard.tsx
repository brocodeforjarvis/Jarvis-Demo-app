
import React from 'react';
import { View } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ShieldCheck, Zap, Activity, Cpu } from 'lucide-react';

const mockData = Array.from({ length: 20 }).map((_, i) => ({
  name: i,
  val: 40 + Math.random() * 20,
  cpu: 10 + Math.random() * 5,
}));

interface DashboardProps {
  onAction: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAction }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 h-full">
      {/* Central HUD Circle */}
      <div className="lg:col-span-6 flex flex-col items-center justify-center p-8 bg-cyan-950/5 border border-cyan-900/30 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#0891b2_0%,_transparent_70%)]"></div>
        
        {/* The Jarvis Core */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Rotating Rings */}
          <div className="absolute inset-0 border-2 border-dashed border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-4 border border-cyan-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
          <div className="absolute inset-8 border-4 border-double border-cyan-300/10 rounded-full"></div>
          
          {/* Main Core */}
          <div className="w-32 h-32 rounded-full bg-cyan-500/10 flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.2)] animate-pulse border border-cyan-500/40 backdrop-blur-sm">
            <div className="text-center">
              <div className="hud-font text-3xl font-black text-cyan-400 drop-shadow-[0_0_10px_#22d3ee]">J</div>
              <div className="text-[6px] uppercase tracking-widest text-cyan-600 font-bold">Protocol Active</div>
            </div>
          </div>

          {/* Orbiting Points */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <div 
              key={deg}
              className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]"
              style={{
                transform: `rotate(${deg}deg) translateX(110px)`
              }}
            ></div>
          ))}
        </div>

        <div className="mt-12 text-center z-10">
          <h2 className="hud-font text-2xl font-bold uppercase tracking-widest mb-2">Systems Nominal</h2>
          <p className="text-cyan-700 text-xs max-w-md mx-auto leading-relaxed">
            All background processes are executing within safety parameters. 
            Waiting for your next command, sir.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button 
              onClick={() => onAction(View.VOICE)}
              className="px-6 py-2 bg-cyan-500 text-slate-950 hud-font text-xs font-bold rounded-full hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              INITIALIZE VOICE
            </button>
            <button 
              onClick={() => onAction(View.PROJECTS)}
              className="px-6 py-2 border border-cyan-500 text-cyan-400 hud-font text-xs font-bold rounded-full hover:bg-cyan-500/10 transition-all"
            >
              PROJECT ANALYTICS
            </button>
          </div>
        </div>
      </div>

      {/* Side Stats */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<ShieldCheck className="text-green-500" />} label="Security" value="Encrypted" subValue="256-Bit SSL" />
          <StatCard icon={<Zap className="text-yellow-500" />} label="Core Load" value="12.4%" subValue="Stable" />
          <StatCard icon={<Activity className="text-cyan-500" />} label="Neural Link" value="98%" subValue="Synchronized" />
          <StatCard icon={<Cpu className="text-purple-500" />} label="Processors" value="16 Core" subValue="Threaded" />
        </div>

        {/* Telemetry Charts */}
        <div className="flex-1 bg-cyan-950/5 border border-cyan-900/30 rounded-3xl p-6">
          <h3 className="hud-font text-sm uppercase tracking-widest mb-4 flex items-center justify-between">
            System Telemetry
            <span className="text-[10px] text-cyan-600">LIVE FEED</span>
          </h3>
          <div className="h-48 w-full opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#22d3ee" fillOpacity={1} fill="url(#colorVal)" />
                <Line type="monotone" dataKey="cpu" stroke="#8b5cf6" dot={false} strokeWidth={1} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
             {[1,2,3].map(i => (
               <div key={i} className="h-1 w-full bg-cyan-900 rounded-full overflow-hidden">
                 <div className="h-full bg-cyan-500" style={{ width: `${30 + Math.random() * 50}%` }}></div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue }: { icon: any, label: string, value: string, subValue: string }) => (
  <div className="p-4 bg-cyan-950/5 border border-cyan-900/30 rounded-2xl flex items-center gap-4 hover:border-cyan-500/40 transition-colors">
    <div className="p-2 bg-slate-900 rounded-lg">{icon}</div>
    <div>
      <div className="text-[10px] uppercase text-cyan-600 font-bold tracking-widest">{label}</div>
      <div className="hud-font text-lg font-bold text-cyan-200">{value}</div>
      <div className="text-[8px] uppercase text-cyan-700">{subValue}</div>
    </div>
  </div>
);

export default Dashboard;
