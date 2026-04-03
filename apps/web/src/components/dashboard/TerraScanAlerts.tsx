'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher, SERVICE_URLS } from '@/lib/api';

const MOCK_ALERTS = [
  { id: '1', type: 'flood', icon: '🌊', severity: 'HIGH', region: 'River District', stat: '+2m water level' },
  { id: '2', type: 'fire', icon: '🔥', severity: 'CRITICAL', region: 'North Forest', stat: 'Acreage +15%/hr' },
  { id: '3', type: 'air', icon: '💨', severity: 'MEDIUM', region: 'Industrial Zone', stat: 'AQI 145' },
];

export default function TerraScanAlerts() {
  const { data: rawAlerts } = useSWR(`${SERVICE_URLS.terraScan}/api/alerts?limit=5`, fetcher);
  const alerts = rawAlerts || MOCK_ALERTS;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const mockReport = `## TerraScan Gemini Report\n**Threat Level**: CRITICAL\n**Confidence**: 92%\nAnalysis of recent satellite imagery indicates rapid expansion in the designated zone. Immediate evacuation warnings recommended.`;

  return (
    <div className="bg-[#1A0533] p-6 rounded-xl border border-purple-900/50 h-[400px] flex flex-col relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold font-outfit text-white">🌍 TerraScan Alerts</h2>
        <button onClick={() => setModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1 rounded transition-colors">+ New Scan</button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3">
        {alerts.map((alert: any) => (
          <div key={alert.id} className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 transition-all">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{alert.icon}</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">{alert.region}</h4>
                  <span className="text-xs text-indigo-300">{alert.stat}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${alert.severity === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' : alert.severity === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-black'}`}>
                  {alert.severity}
                </span>
                <button 
                  onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
                  className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer"
                >
                  {expandedId === alert.id ? 'Hide Report' : 'View Report'}
                </button>
              </div>
            </div>
            
            {expandedId === alert.id && (
              <div className="mt-3 p-3 bg-gray-900/50 rounded border border-gray-700 text-xs text-gray-300 whitespace-pre-wrap font-space-mono">
                {mockReport}
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-20 backdrop-blur-sm">
          <div className="bg-[#1E124A] p-6 rounded-xl border border-emerald-500 w-full max-w-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <h3 className="text-lg font-bold text-emerald-400 mb-3">Initiate Satellite Scan</h3>
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1">Region Name</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white focus:border-emerald-500 outline-none" placeholder="e.g. Sector 12 Forest" />
            </div>
            <div className="bg-gray-800 p-8 border border-dashed border-gray-500 flex items-center justify-center rounded cursor-crosshair mb-4 text-xs text-gray-500 text-center">
              [Map View] <br /> Click and drag to draw polygon
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded py-2 text-sm transition-colors">Cancel</button>
              <button onClick={() => setModalOpen(false)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded py-2 text-sm transition-colors font-bold">Start Scan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
