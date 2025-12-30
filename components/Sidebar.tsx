
import React from 'react';
import { View } from '../types';
import { Mic, Cloud, Camera, Palette, LayoutDashboard, Code, Settings, Cpu } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: View.DASHBOARD, icon: LayoutDashboard, label: 'Systems' },
    { id: View.VOICE, icon: Mic, label: 'Voice' },
    { id: View.WEATHER, icon: Cloud, label: 'Atmosphere' },
    { id: View.CAMERA, icon: Camera, label: 'Optics' },
    { id: View.IMAGE_GEN, icon: Palette, label: 'Synthesis' },
    { id: View.PROJECTS, icon: Code, label: 'Analysis' },
    { id: View.SETTINGS, icon: Settings, label: 'Configs' },
  ];

  return (
    <aside className="w-20 lg:w-64 border-r border-cyan-900/50 bg-slate-950 flex flex-col items-center py-6 gap-8 z-20">
      <div className="flex items-center gap-3 lg:px-6 w-full mb-4">
        <div className="p-2 bg-cyan-950 border border-cyan-500 rounded-lg shadow-[0_0_10px_#22d3ee]">
          <Cpu className="text-cyan-400" size={24} />
        </div>
        <div className="hidden lg:block">
          <h1 className="hud-font text-lg font-bold leading-none">JARVIS</h1>
          <p className="text-[8px] uppercase tracking-[0.2em] text-cyan-600">Intelligent Core</p>
        </div>
      </div>

      <nav className="flex-1 w-full flex flex-col gap-2 lg:px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all group ${
              currentView === item.id 
                ? 'bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]' 
                : 'text-cyan-800 hover:text-cyan-400 hover:bg-cyan-900/10'
            }`}
          >
            <item.icon size={24} strokeWidth={currentView === item.id ? 2.5 : 1.5} />
            <span className="hidden lg:block hud-font text-xs uppercase tracking-widest">{item.label}</span>
            {currentView === item.id && (
              <div className="hidden lg:block ml-auto w-1 h-4 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="w-full lg:px-6 text-[8px] uppercase text-cyan-900 lg:block hidden">
        <p className="mb-1">Version: 4.0.0-PRO</p>
        <p>© Stark Industries 2025</p>
      </div>
    </aside>
  );
};

export default Sidebar;
