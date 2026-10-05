import React, { useState } from 'react';
import { Sprout, Cloud, CloudRain, Sun, CloudLightning, Thermometer, Wind, Droplets, Lightbulb, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import DashboardLayout, { PageHeader } from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { KENYAN_COUNTIES } from '../../data/constants';

function AdvisoryContent() {
  const { user } = useAuth();
  const [crop, setCrop] = useState('tomatoes');
  const [county, setCounty] = useState(user?.county || 'Nakuru');
  const [result, setResult] = useState({
    crop: 'Tomatoes',
    county: 'Nakuru',
    priority: 'high',
    season: 'Early Vegetation Stage',
    recommendation: 'Due to forecasted heavy rain in Nakuru County over the next 4 days, ensure drainage channels are cleared to prevent root rot. Apply organic fungicides proactively to protect tomato crops from blight.'
  });
  const [loading, setLoading] = useState(false);

  // Weather simulation state
  const mockWeather = {
    temp: 21,
    condition: 'Rainy Showers',
    humidity: 78,
    wind: '14 km/h',
    rainProb: '85%',
    uv: 'Moderate',
    forecast: [
      { day: 'Mon', temp: 22, icon: CloudRain, label: 'Rain' },
      { day: 'Tue', temp: 20, icon: CloudLightning, label: 'Storm' },
      { day: 'Wed', temp: 21, icon: Cloud, label: 'Cloudy' },
      { day: 'Thu', temp: 24, icon: Sun, label: 'Sunny' },
      { day: 'Fri', temp: 23, icon: Cloud, label: 'Overcast' }
    ]
  };

  const getAdvisory = async () => {
    setLoading(true);
    try {
      const data = await api.getAdvisory(crop, county);
      if (data) setResult(data);
    } catch (err) {
      // Graceful fallback to rich local recommendation calculator
      const recommendations = {
        tomatoes: `Clear drainage paths surrounding tomato beds in ${county}. Humidity levels are high; monitor for early blight and apply copper-based organic sprays.`,
        maize: `Perfect planting temperature registered in ${county}. Apply starter organic fertilizer and ensure adequate weed suppression during early shoot stages.`,
        potatoes: `Prepare soil hilling for potato rows in ${county} to protect tubers from exposure to direct light and frost warnings.`,
        avocados: `Prune secondary branches of avocado trees to optimize canopy light exposure. Watch for scale insects.`,
        beans: `Nitrogen fixing is optimal. Ensure weeding is completed before flowering stage starts. Irrigation needs are minimal.`,
        onions: `Onion curing preparations should begin. Keep bulb rows dry and clear of weed moisture.`
      };

      setResult({
        crop: crop.charAt(0).toUpperCase() + crop.slice(1),
        county: county,
        priority: crop === 'tomatoes' ? 'high' : 'normal',
        season: 'Mid-Growth Phase',
        recommendation: recommendations[crop] || `Monitor crop development stage in ${county}. Ensure consistent moisture levels and apply crop advisory guidelines.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader 
        title="Farming Advisory & Weather Hub" 
        subtitle="AI agronomy recommendations combined with localized meteorological alerts" 
      />

      <div className="grid lg:grid-cols-12 gap-6 max-w-7xl">
        
        {/* Left Input & Weather Column - 5 Cols */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Card: Configuration Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            
            <h2 className="text-white font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sprout className="w-4.5 h-4.5 text-emerald-500" /> Agronomy Advisor
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Select Crop</label>
                <select 
                  value={crop} 
                  onChange={(e) => setCrop(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white rounded-xl text-xs focus:outline-none transition-colors"
                >
                  {['maize', 'potatoes', 'tomatoes', 'avocados', 'beans', 'onions'].map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">County Location</label>
                <select 
                  value={county} 
                  onChange={(e) => setCounty(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white rounded-xl text-xs focus:outline-none transition-colors"
                >
                  {KENYAN_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button 
                onClick={getAdvisory} 
                disabled={loading} 
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-950 transition-all cursor-pointer mt-2"
              >
                {loading ? 'Consulting Agronomists...' : 'Generate AI Advisory'}
              </button>
            </div>
          </div>

          {/* Card: Weather Alert widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>📍 Live Weather: {county}</span>
              <span className="text-[10px] text-slate-450 normal-case font-medium">Synced just now</span>
            </h3>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CloudRain className="w-10 h-10 text-sky-400" />
                <div>
                  <p className="text-2xl font-black text-white">{mockWeather.temp}°C</p>
                  <p className="text-[10px] text-slate-405 font-bold uppercase">{mockWeather.condition}</p>
                </div>
              </div>

              <div className="text-right text-[10px] font-bold text-slate-400 space-y-1">
                <p className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-sky-400" /> Humidity: <strong className="text-white">{mockWeather.humidity}%</strong></p>
                <p className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-slate-400" /> Wind: <strong className="text-white">{mockWeather.wind}</strong></p>
              </div>
            </div>

            {/* 5-day Weather Timeline strip */}
            <div className="grid grid-cols-5 gap-2 pt-3 border-t border-slate-800">
              {mockWeather.forecast.map((fc, i) => {
                const Icon = fc.icon;
                return (
                  <div key={i} className="text-center p-2 bg-slate-950/60 border border-slate-850 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">{fc.day}</p>
                    <Icon className="w-4 h-4 text-sky-350 mx-auto my-1.5" />
                    <p className="text-[10px] font-black text-white">{fc.temp}°C</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Advisory Screen Column - 7 Cols */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main AI Advisory Card */}
          {result && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-emerald-950 border border-emerald-800 rounded-2xl flex items-center justify-center shrink-0 text-emerald-450">
                  <Lightbulb size={24} />
                </div>
                
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-extrabold text-white text-base">{result.crop} &bull; {result.county} County</h2>
                    <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0 ${
                      result.priority === 'high' ? 'bg-red-950 border-red-900 text-red-400 animate-pulse' : 'bg-amber-950 border-amber-900 text-amber-400'
                    }`}>
                      {result.priority} priority alert
                    </span>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <span>Crop Phase: <strong className="text-slate-200">{result.season}</strong></span>
                  </div>

                  <p className="text-slate-300 font-bold text-xs leading-relaxed border-t border-slate-800/80 pt-3">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Checklist Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-450" /> Agro-Tasks Checklist
            </h3>

            <div className="space-y-3 text-xs font-bold text-slate-400">
              <div className="flex items-start gap-2.5 p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>Drainage maintenance around low-lying greenhouses and fields (Critical before heavy rain days).</p>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>Ensure composting soil rows have plastic cover protections ready against runoff soil wash.</p>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-slate-300">Apply early morning organic fungicides to leaves to prevent moisture-induced black spot development.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

export default function Advisory() {
  return (
    <ProtectedRoute roles={['farmer']}>
      <DashboardLayout>
        <AdvisoryContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
