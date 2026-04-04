'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { fetcher, SERVICE_URLS } from '@/lib/api';
import 'leaflet/dist/leaflet.css';

// Load react-leaflet components client-side to prevent SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false, loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl" /> });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

function getColorForFeature(view: 'safety' | 'crime', properties: any) {
  if (view === 'safety') {
    const score = properties.score || 0;
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 50) return '#eab308'; // Yellow
    if (score >= 20) return '#f97316'; // Orange
    return '#ef4444'; // Red
  } else {
    const risk = properties.riskScore || 0;
    if (risk <= 3) return '#22c55e';
    if (risk <= 6) return '#eab308';
    if (risk <= 8) return '#f97316';
    return '#ef4444';
  }
}

function getDetailsForFeature(view: 'safety' | 'crime', properties: any) {
  if (view === 'safety') {
    const score = properties.score || 0;
    return {
      percentage: `${score.toFixed(0)}%`,
      label: 'Safety Score',
      desc: 'Based on recent incident reports.',
      incidents: properties.incidentCount || 0
    };
  } else {
    const risk = properties.riskScore || 0;
    return {
      percentage: `${(risk * 10).toFixed(0)}%`,
      label: 'Predicted Crime Risk',
      desc: properties.reasoning || 'AI analysis based on historical data.',
      timeSlot: properties.timeSlot || ''
    };
  }
}

export default function SafetyHeatmap() {
  const [view, setView] = useState<'safety' | 'crime'>('safety');
  
  const endpoint = view === 'safety' 
    ? `${SERVICE_URLS.guardianNet}/api/safety/heatmap`
    : `${SERVICE_URLS.sentinelAI}/api/predictions/heatmap`;
    
  const { data } = useSWR(endpoint, fetcher, { refreshInterval: 60000 });
  
  const features = useMemo(() => {
    return Array.isArray(data?.features) ? data.features : [];
  }, [data]);

  const defaultCenter: [number, number] = [37.7749, -122.4194]; // SF default if no features

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
        <MapContainer 
          center={defaultCenter} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />
          {features.map((feature: any, idx: number) => {
             const coords = feature?.geometry?.coordinates;
             if (!coords || coords.length !== 2) return null;
             // GeoJSON is [lng, lat], Leaflet wants [lat, lng]
             const latLng: [number, number] = [coords[1], coords[0]];
             const color = getColorForFeature(view, feature.properties);
             const details = getDetailsForFeature(view, feature.properties);
             
             return (
               <Circle 
                 key={idx} 
                 center={latLng} 
                 radius={800} // 800 meters mapped area
                 pathOptions={{ color, fillColor: color, fillOpacity: 0.4, weight: 2 }}
               >
                 <Popup>
                   <div className="p-1 min-w-[200px]">
                     <div className="flex items-center space-x-2 mb-2">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                       <strong className="text-sm font-semibold">{details.label}</strong>
                     </div>
                     <div className="text-2xl font-bold font-space-mono text-slate-800 mb-2">
                       {details.percentage}
                     </div>
                     {view === 'safety' ? (
                       <p className="text-xs text-slate-600">
                         {details.incidents} recent incident(s)<br/>
                         {details.desc}
                       </p>
                     ) : (
                       <div className="text-xs text-slate-600 space-y-1">
                         <p><strong>Prediction:</strong> {details.desc}</p>
                         {details.timeSlot && <p><strong>Time:</strong> {details.timeSlot}</p>}
                         <div className="mt-2 text-[10px] uppercase text-indigo-500 font-bold tracking-wider">
                           ⚡ Gemini AI Output
                         </div>
                       </div>
                     )}
                   </div>
                 </Popup>
               </Circle>
             );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
