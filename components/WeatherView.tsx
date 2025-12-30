
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Droplets, Wind, MapPin, Thermometer } from 'lucide-react';
import { WeatherData } from '../types';

const WeatherView: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          // Using open-meteo as a free, non-key weather API
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m`);
          const data = await res.json();
          
          setWeather({
            temperature: data.current_weather.temperature,
            condition: getWeatherCondition(data.current_weather.weathercode),
            humidity: data.hourly.relativehumidity_2m[0],
            windSpeed: data.current_weather.windspeed,
            location: "Local Sector"
          });
          setLoading(false);
        }, () => {
          // Fallback if geo fails
          setWeather({
            temperature: 24,
            condition: "Simulated Clear",
            humidity: 45,
            windSpeed: 12,
            location: "Unknown Base"
          });
          setLoading(false);
        });
      } catch (e) {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherCondition = (code: number) => {
    if (code === 0) return "Clear Skies";
    if (code < 4) return "Partly Cloudy";
    if (code < 10) return "Overcast";
    return "Atmospheric Instability";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="hud-font text-xs uppercase tracking-widest animate-pulse">Scanning Atmosphere...</p>
      </div>
    );
  }

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-center">
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-cyan-950/5 border border-cyan-900/30 p-12 rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Cloud size={160} className="text-cyan-400" />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-cyan-900/30 rounded-2xl">
              <MapPin className="text-cyan-400" size={24} />
            </div>
            <div>
              <h3 className="hud-font text-xl uppercase tracking-widest text-cyan-200">{weather?.location}</h3>
              <p className="text-[10px] text-cyan-600 font-bold tracking-[0.3em]">GEOSPATIAL LINK ESTABLISHED</p>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <div className="flex flex-col">
              <span className="hud-font text-[6rem] font-black leading-none text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                {Math.round(weather?.temperature || 0)}°
              </span>
              <span className="hud-font text-xl uppercase tracking-[0.4em] text-cyan-600 ml-2">CELSIUS</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 text-cyan-200">
                <Sun size={32} />
                <span className="hud-font text-2xl uppercase tracking-widest">{weather?.condition}</span>
              </div>
              <p className="text-cyan-800 text-xs italic max-w-xs">Ambient atmospheric parameters are within operational comfort thresholds, sir.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Metric icon={<Droplets />} label="Humidity" value={`${weather?.humidity}%`} />
          <Metric icon={<Wind />} label="Wind Velocity" value={`${weather?.windSpeed} km/h`} />
          <Metric icon={<Thermometer />} label="Dew Point" value="14°C" />
        </div>
      </div>

      <div className="lg:col-span-5 h-full flex flex-col gap-6">
        <div className="flex-1 bg-cyan-950/5 border border-cyan-900/30 rounded-3xl p-8 relative">
           <div className="hud-font text-xs uppercase tracking-widest text-cyan-600 mb-6 border-b border-cyan-900/40 pb-2">Atmospheric Saturation</div>
           <div className="space-y-6">
             {[
               { label: 'Oxygen', val: 21 },
               { label: 'Nitrogen', val: 78 },
               { label: 'Argon', val: 0.9 },
               { label: 'CO2', val: 0.04 }
             ].map((gas, i) => (
               <div key={i}>
                 <div className="flex justify-between text-[10px] uppercase font-bold text-cyan-400 mb-1">
                   <span>{gas.label}</span>
                   <span>{gas.val}%</span>
                 </div>
                 <div className="h-1 bg-cyan-900 rounded-full overflow-hidden">
                   <div className="h-full bg-cyan-500 shadow-[0_0_8px_#22d3ee]" style={{ width: `${gas.val}%` }}></div>
                 </div>
               </div>
             ))}
           </div>
           
           <div className="mt-12 p-4 border border-cyan-500/20 bg-cyan-500/5 rounded-xl text-[10px] text-cyan-400 uppercase tracking-widest leading-loose">
             <div className="flex justify-between border-b border-cyan-500/10 pb-1 mb-1">
                <span>UV INDEX</span>
                <span>LOW (2.1)</span>
             </div>
             <div className="flex justify-between border-b border-cyan-500/10 pb-1 mb-1">
                <span>VISIBILITY</span>
                <span>12.4 KM</span>
             </div>
             <div className="flex justify-between">
                <span>PRESSURE</span>
                <span>1013 MBAR</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="bg-cyan-950/5 border border-cyan-900/30 p-6 rounded-2xl text-center group hover:bg-cyan-500/5 transition-all">
    <div className="inline-flex p-3 bg-slate-900 rounded-xl mb-4 text-cyan-500 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="text-[10px] uppercase font-bold text-cyan-700 tracking-[0.2em] mb-1">{label}</div>
    <div className="hud-font text-lg font-bold text-cyan-200">{value}</div>
  </div>
);

export default WeatherView;
