'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { fetcher, SERVICE_URLS } from '@/lib/api';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl" /> }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

export default function SafetyHeatmap() {
  const [view, setView] = useState<'safety' | 'crime'>('safety');
  const endpoint = view === 'safety' 
    ? `${SERVICE_URLS.guardianNet}/api/safety/heatmap`
    : `${SERVICE_URLS.sentinelAI}/api/predictions/heatmap`;
    
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold font-outfit text-slate-800">City Zone Analysis</h2>
        <div className="bg-slate-100 rounded-lg p-1">
          <button 
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'safety' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setView('safety')}
          >
            Safety
          </button>
          <button 
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'crime' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setView('crime')}
          >
            Crime Risk
          </button>
        </div>
      </div>
      <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 relative z-0">
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />
        </MapContainer>
      </div>
    </div>
  );
}
