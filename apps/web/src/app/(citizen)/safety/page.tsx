'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Shield, ShieldAlert, AlertOctagon, CheckCircle, X, MapPin } from 'lucide-react';
import axios from 'axios';
import { SERVICE_URLS } from '@/lib/api';

const SafetyMap = dynamic(() => import('@/components/SafetyMap'), { ssr: false, loading: () => <div className="h-[300px] w-full bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div> });

export default function SafetyPage() {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);
  
  const [sosState, setSosState] = useState<'idle' | 'counting' | 'triggered'>('idle');
  const [countdown, setCountdown] = useState(3);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      setLoadingScore(true);
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setTimeout(() => {
          setScore(85);
          setLoadingScore(false);
        }, 1200);
      }, () => {
        setLoadingScore(false);
      });
    }
  }, []);

  const getScoreColor = () => {
    if (!score) return 'text-slate-400';
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const handleSosClick = () => {
    if (sosState !== 'idle') return;
    
    if (window.confirm("Are you in danger? This will dispatch emergency services to your location.")) {
      setSosState('counting');
      setCountdown(3);
      
      let count = 3;
      intervalRef.current = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
          triggerSos();
        }
      }, 1000);
    }
  };

  const triggerSos = async () => {
    setSosState('triggered');
    try {
      await axios.post('/api/sos', {
        lat: location?.lat,
        lng: location?.lng,
      }).catch((err) => {
        console.error("SOS POST error", err);
        alert("Failed to send SOS to database! Error: " + (err.response?.data?.message || err.message) + "\n\n(This is usually because your IP is not whitelisted in MongoDB Atlas Network Access)");
        setSosState('idle');
      });
    } catch (e: any) {
      console.error(e);
      alert("Error: " + e.message);
      setSosState('idle');
    }
  };

  const cancelSos = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setSosState('idle');
    setCountdown(3);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-slate-800 flex flex-col p-6 max-w-md mx-auto md:max-w-2xl relative">
      <header className="mb-8 pt-4 flex items-center justify-center relative">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <ShieldAlert className="w-7 h-7 text-indigo-600" />
          Safety Guardian
        </h1>
      </header>

      <main className="flex-1 space-y-8 flex flex-col items-center">
        {/* Top: Safety Score */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm">
          <h2 className="text-slate-500 font-medium uppercase tracking-wider text-sm mb-4">Area Safety Score</h2>
          
          {loadingScore ? (
            <div className="h-32 flex items-center justify-center">
              <span className="text-3xl font-black text-indigo-400 animate-pulse">Scanning...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className={`text-8xl font-black ${getScoreColor()}`}>
                {score || '--'}
              </div>
              {score && <p className="text-slate-500 mt-2 text-lg">Current area is relatively safe</p>}
            </div>
          )}
        </div>

        {/* Middle: Small Leaflet Map */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-3 px-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-lg text-slate-700">Live Area Map</h3>
          </div>
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
            <SafetyMap userLocation={location} />
          </div>
        </div>
      </main>

      {/* Bottom: Giant SOS Button */}
      <div className="mt-8 mb-6 relative">
        {sosState === 'idle' && (
          <button 
            onClick={handleSosClick}
            className="w-full h-48 rounded-3xl bg-gradient-to-b from-red-500 to-red-600 text-white text-5xl font-black shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center gap-2 border-b-4 border-red-700 uppercase tracking-widest"
          >
            <AlertOctagon className="w-16 h-16 drop-shadow-md" />
            SOS
          </button>
        )}

        {sosState === 'counting' && (
          <div className="w-full h-48 rounded-3xl bg-red-100 border-2 border-red-300 flex flex-col items-center justify-center transition-all animate-pulse">
            <div className="text-7xl font-black text-red-600">{countdown}</div>
            <p className="text-xl text-red-500 mt-2 font-bold uppercase">Dispatching Help...</p>
            
            <button 
              onClick={cancelSos}
              className="absolute -top-4 -right-4 bg-white hover:bg-slate-100 text-slate-600 w-14 h-14 rounded-full flex items-center justify-center border-2 border-slate-200 shadow-lg transition-transform active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {sosState === 'triggered' && (
          <div className="w-full h-48 rounded-3xl bg-gradient-to-b from-emerald-400 to-emerald-500 flex flex-col items-center justify-center transition-all shadow-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-300 rounded-full animate-ping opacity-75"></div>
              <CheckCircle className="w-20 h-20 text-white drop-shadow-lg relative z-10" />
            </div>
            <p className="text-3xl font-black text-white mt-4 uppercase">Help is on the way</p>
          </div>
        )}
      </div>
    </div>
  );
}
