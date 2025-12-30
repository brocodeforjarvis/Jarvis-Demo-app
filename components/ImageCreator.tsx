
import React, { useState } from 'react';
import { Palette, Send, Download, Sparkles, Loader2 } from 'lucide-react';
import { generateAIImage } from '../services/geminiService';
import { GeneratedImage } from '../types';

const ImageCreator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const imageUrl = await generateAIImage(prompt);
      if (imageUrl) {
        const newImg: GeneratedImage = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt,
          timestamp: new Date()
        };
        setImages([newImg, ...images]);
        setPrompt("");
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string, p: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `JARVIS-GEN-${p.slice(0, 10)}.png`;
    link.click();
  };

  return (
    <div className="p-8 h-full flex flex-col gap-8">
      <div className="bg-cyan-950/5 border border-cyan-900/30 p-8 rounded-3xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-cyan-500/10 rounded-2xl">
            <Palette className="text-cyan-400" size={24} />
          </div>
          <div>
            <h2 className="hud-font text-xl uppercase tracking-widest text-cyan-200">Creative Synthesis</h2>
            <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest">Neural Visualization Engine active</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the neural projection, sir..."
              className="w-full bg-slate-950/50 border border-cyan-900/50 rounded-2xl px-6 py-4 text-cyan-200 focus:outline-none focus:border-cyan-500/50 placeholder:text-cyan-900 transition-all font-medium"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
               <Sparkles size={20} className="text-cyan-400" />
            </div>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-8 bg-cyan-500 text-slate-950 hud-font text-xs font-black rounded-2xl hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            SYNTHESIZE
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img.id} className="group relative bg-cyan-950/5 border border-cyan-900/30 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all p-2">
              <div className="aspect-square relative rounded-xl overflow-hidden mb-4 bg-slate-900">
                <img src={img.url} alt={img.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <button 
                  onClick={() => handleDownload(img.url, img.prompt)}
                  className="absolute bottom-4 right-4 p-3 bg-cyan-500 text-slate-950 rounded-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all shadow-lg"
                >
                  <Download size={20} />
                </button>
              </div>
              <div className="px-2">
                <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest mb-1 truncate">{img.prompt}</p>
                <p className="text-[8px] text-cyan-900 font-medium">Rendered: {img.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          
          {isGenerating && (
            <div className="aspect-square bg-cyan-500/5 border border-cyan-500/20 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-8 gap-4">
              <div className="relative w-16 h-16">
                 <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full"></div>
                 <div className="absolute inset-0 border-2 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
              <p className="hud-font text-[10px] uppercase tracking-widest text-cyan-400 animate-pulse">Compiling Pixel Arrays...</p>
            </div>
          )}

          {images.length === 0 && !isGenerating && (
            <div className="col-span-full h-64 flex flex-col items-center justify-center opacity-20">
               <Palette size={64} className="mb-4" />
               <p className="hud-font text-xs uppercase tracking-[0.2em]">Visualizer Stream Empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCreator;
